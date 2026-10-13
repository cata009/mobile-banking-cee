package com.mobilebanking.cee.demo

import android.annotation.SuppressLint
import android.app.Activity
import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.hardware.biometrics.BiometricManager
import android.hardware.biometrics.BiometricPrompt
import android.hardware.fingerprint.FingerprintManager
import android.os.Build
import android.os.CancellationSignal
import android.net.Uri
import android.provider.OpenableColumns
import android.util.Base64
import android.view.WindowManager
import androidx.core.content.FileProvider
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.UiThreadUtil
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.BaseActivityEventListener
import java.io.File
import java.io.ByteArrayOutputStream
import java.util.concurrent.Executors
import java.util.concurrent.RejectedExecutionException

/** Local device facilities only. No account credentials or biometric templates leave Android. */
class CeeDemoDeviceModule(private val context: ReactApplicationContext) : ReactContextBaseJavaModule(context) {
  override fun getName() = "CeeDemoDevice"
  override fun getConstants(): MutableMap<String, Any> = mutableMapOf("otaBaseURL" to BuildConfig.OTA_BASE_URL)
  private var biometricRequest: CancellationSignal? = null
  private var biometricPromise: Promise? = null
  private var biometricGeneration = 0
  @Volatile private var filePickerPromise: Promise? = null
  @Volatile private var invalidated = false
  private val documentExecutor = Executors.newSingleThreadExecutor { task ->
    Thread(task, "CeeDemoDocumentMetadata").apply { isDaemon = true }
  }
  private val filePickerCode = 48271
  private val filePickerListener = object : BaseActivityEventListener() {
    override fun onActivityResult(activity: Activity, requestCode: Int, resultCode: Int, data: Intent?) {
      if (requestCode != filePickerCode || invalidated) return
      val pending = filePickerPromise ?: return
      val uri = data?.data
      if (resultCode != Activity.RESULT_OK || uri == null) {
        filePickerPromise = null
        pending.resolve(null)
        return
      }
      try {
        documentExecutor.execute {
          try {
            var filename = "documento"
            var size = -1L
            context.contentResolver.query(uri, arrayOf(OpenableColumns.DISPLAY_NAME, OpenableColumns.SIZE), null, null, null)?.use { cursor ->
              if (cursor.moveToFirst()) { filename = cursor.getString(0) ?: filename; if (!cursor.isNull(1)) size = cursor.getLong(1) }
            }
            val metadata = Arguments.createMap().apply {
              putString("uri", uri.toString()); putString("name", filename); putString("mime", context.contentResolver.getType(uri) ?: "application/octet-stream"); putDouble("size", size.toDouble())
            }
            UiThreadUtil.runOnUiThread {
              if (!invalidated && filePickerPromise === pending) {
                filePickerPromise = null
                pending.resolve(metadata)
              }
            }
          } catch (error: Exception) {
            UiThreadUtil.runOnUiThread {
              if (!invalidated && filePickerPromise === pending) {
                filePickerPromise = null
                pending.reject("file-picker-error", "Impossibile selezionare il documento", error)
              }
            }
          }
        }
      } catch (_: RejectedExecutionException) {
        if (filePickerPromise === pending) {
          filePickerPromise = null
          pending.resolve(null)
        }
      }
    }
  }
  init { context.addActivityEventListener(filePickerListener) }

  @ReactMethod
  fun pickLocalDocument(imagesOnly: Boolean, promise: Promise) {
    UiThreadUtil.runOnUiThread {
      if (invalidated) { promise.resolve(null); return@runOnUiThread }
      if (filePickerPromise != null) { promise.reject("file-picker-busy", "Selezione già aperta"); return@runOnUiThread }
      val activity = context.currentActivity
      if (activity == null) { promise.reject("file-picker-unavailable", "Selezione non disponibile"); return@runOnUiThread }
      filePickerPromise = promise
      try {
        val intent = Intent(Intent.ACTION_OPEN_DOCUMENT).apply {
          addCategory(Intent.CATEGORY_OPENABLE)
          type = if (imagesOnly) "image/*" else "*/*"
          putExtra(Intent.EXTRA_MIME_TYPES, if (imagesOnly) arrayOf("image/png", "image/jpeg", "image/webp") else arrayOf("application/pdf", "image/png", "image/jpeg"))
          addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
        }
        activity.startActivityForResult(intent, filePickerCode)
      } catch (error: Exception) { filePickerPromise = null; promise.reject("file-picker-error", "Impossibile selezionare il documento", error) }
    }
  }

  @ReactMethod
  fun setScreenshotsAllowed(allowed: Boolean, promise: Promise) {
    UiThreadUtil.runOnUiThread {
      try {
        val window = context.currentActivity?.window
        if (window == null) { promise.resolve(false); return@runOnUiThread }
        if (allowed) window.clearFlags(WindowManager.LayoutParams.FLAG_SECURE)
        else window.addFlags(WindowManager.LayoutParams.FLAG_SECURE)
        promise.resolve(true)
      } catch (error: Exception) { promise.reject("screen-privacy-error", "Impossibile aggiornare la protezione dello schermo", error) }
    }
  }

  @ReactMethod
  fun readOriginalAsset(value: String, promise: Promise) {
    try {
      val uri = Uri.parse(value)
      val input = when (uri.scheme) {
        "file" -> {
          val file = File(uri.path ?: "").canonicalFile
          val inside = listOf(context.filesDir, context.cacheDir).any { file.path.startsWith(it.canonicalPath + File.separator) }
          if (!inside) throw IllegalArgumentException("Asset path outside application storage")
          file.inputStream()
        }
        "android.resource" -> {
          if (uri.authority != context.packageName) throw IllegalArgumentException("Foreign resource")
          context.contentResolver.openInputStream(uri) ?: throw IllegalArgumentException("Missing asset")
        }
        null -> {
          if (!value.matches(Regex("[a-z0-9_]+"))) throw IllegalArgumentException("Invalid resource name")
          val id = context.resources.getIdentifier(value, "drawable", context.packageName)
          if (id == 0) throw IllegalArgumentException("Missing asset")
          context.resources.openRawResource(id)
        }
        else -> throw IllegalArgumentException("Only original application assets are supported")
      }
      val bytes = input.use { stream ->
        val output = ByteArrayOutputStream()
        val buffer = ByteArray(8192)
        var total = 0
        while (true) {
          val count = stream.read(buffer)
          if (count < 0) break
          total += count
          if (total > 8 * 1024 * 1024) throw IllegalArgumentException("Asset too large")
          output.write(buffer, 0, count)
        }
        output.toByteArray()
      }
      val mime = when {
        bytes.size >= 3 && (bytes[0].toInt() and 255) == 255 && (bytes[1].toInt() and 255) == 216 -> "image/jpeg"
        bytes.size >= 8 && (bytes[0].toInt() and 255) == 137 && bytes[1].toInt() == 80 -> "image/png"
        bytes.size >= 12 && String(bytes.copyOfRange(0, 4)) == "RIFF" && String(bytes.copyOfRange(8, 12)) == "WEBP" -> "image/webp"
        else -> throw IllegalArgumentException("Unsupported document asset")
      }
      promise.resolve(Arguments.createMap().apply { putString("base64", Base64.encodeToString(bytes, Base64.NO_WRAP)); putString("mime", mime) })
    } catch (error: Exception) { promise.reject("asset-read-error", "Impossibile aprire il documento originale", error) }
  }

  @ReactMethod
  fun copyText(value: String, promise: Promise) {
    UiThreadUtil.runOnUiThread {
      try {
        val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
        clipboard.setPrimaryClip(ClipData.newPlainText("Demo", value))
        promise.resolve(true)
      } catch (error: Exception) { promise.reject("clipboard-error", "Impossibile copiare il testo", error) }
    }
  }

  @ReactMethod
  fun shareFile(filename: String, mime: String, encoded: String, promise: Promise) {
    val allowed = setOf("application/pdf", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "text/csv", "text/plain", "image/png", "image/jpeg", "image/webp")
    if (mime !in allowed || encoded.length > 12 * 1024 * 1024) {
      promise.reject("invalid-document", "Documento non supportato")
      return
    }
    try {
      val safeName = filename.replace(Regex("[^A-Za-z0-9._-]"), "_").take(120)
      if (safeName.isEmpty() || safeName == "." || safeName == "..") throw IllegalArgumentException("Invalid filename")
      val directory = File(context.cacheDir, "demo-exports").apply { mkdirs() }
      val file = File(directory, safeName)
      if (file.canonicalFile.parentFile != directory.canonicalFile) throw IllegalArgumentException("Invalid path")
      file.writeBytes(Base64.decode(encoded, Base64.NO_WRAP))
      val uri = FileProvider.getUriForFile(context, context.packageName + ".demo.files", file)
      UiThreadUtil.runOnUiThread {
        try {
          val intent = Intent(Intent.ACTION_SEND).apply {
            type = mime
            putExtra(Intent.EXTRA_STREAM, uri)
            clipData = ClipData.newRawUri("Documento demo", uri)
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
          }
          val chooser = Intent.createChooser(intent, "Condividi documento")
          val activity = context.currentActivity
          if (activity != null) activity.startActivity(chooser)
          else context.startActivity(chooser.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
          promise.resolve(true)
        } catch (error: Exception) { promise.reject("share-error", "Impossibile condividere il documento", error) }
      }
    } catch (error: Exception) { promise.reject("document-error", "Impossibile creare il documento", error) }
  }

  @Suppress("DEPRECATION")
  @SuppressLint("MissingPermission")
  private fun canAuthenticate(): Boolean {
    if (Build.VERSION.SDK_INT >= 29) {
      val manager = context.getSystemService(BiometricManager::class.java)
      val result = if (Build.VERSION.SDK_INT >= 30)
        manager.canAuthenticate(BiometricManager.Authenticators.BIOMETRIC_WEAK)
      else manager.canAuthenticate()
      return result == BiometricManager.BIOMETRIC_SUCCESS
    }
    if (Build.VERSION.SDK_INT == 28) {
      val manager = context.getSystemService(FingerprintManager::class.java)
      return manager?.isHardwareDetected == true && manager.hasEnrolledFingerprints()
    }
    return false
  }

  @ReactMethod
  fun biometricAvailable(promise: Promise) {
    try { promise.resolve(canAuthenticate()) }
    catch (error: Exception) { promise.resolve(false) }
  }

  private fun finishBiometric(result: String, generation: Int = biometricGeneration) {
    if (generation != biometricGeneration) return
    val promise = biometricPromise ?: return
    biometricPromise = null
    biometricRequest = null
    promise.resolve(result)
  }

  @ReactMethod
  @SuppressLint("NewApi", "MissingPermission")
  fun authenticate(title: String, promise: Promise) {
    UiThreadUtil.runOnUiThread {
      if (Build.VERSION.SDK_INT < 28 || !canAuthenticate()) { promise.resolve("unavailable"); return@runOnUiThread }
      val activity = context.currentActivity
      if (activity == null) { promise.resolve("unavailable"); return@runOnUiThread }
      if (biometricPromise != null) { promise.reject("biometric-busy", "Autenticazione già in corso"); return@runOnUiThread }
      try {
        biometricPromise = promise
        val generation = ++biometricGeneration
        val cancellation = CancellationSignal()
        biometricRequest = cancellation
        val builder = BiometricPrompt.Builder(activity)
          .setTitle(title.take(80))
          .setSubtitle("Conferma con la biometria del telefono")
          .setNegativeButton("Annulla", activity.mainExecutor) { _, _ -> finishBiometric("cancelled", generation) }
        if (Build.VERSION.SDK_INT >= 30) builder.setAllowedAuthenticators(BiometricManager.Authenticators.BIOMETRIC_WEAK)
        val prompt = builder.build()
        prompt.authenticate(cancellation, activity.mainExecutor, object : BiometricPrompt.AuthenticationCallback() {
          override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult) { finishBiometric("authenticated", generation) }
          override fun onAuthenticationError(code: Int, text: CharSequence) { finishBiometric("cancelled", generation) }
          override fun onAuthenticationFailed() { /* Android keeps the system prompt open for another attempt. */ }
        })
      } catch (error: Exception) {
        biometricPromise = null
        biometricRequest = null
        promise.reject("biometric-error", "Impossibile aprire l’autenticazione biometrica", error)
      }
    }
  }

  override fun invalidate() {
    invalidated = true
    UiThreadUtil.runOnUiThread {
      context.removeActivityEventListener(filePickerListener)
      filePickerPromise?.resolve(null)
      filePickerPromise = null
    }
    documentExecutor.shutdownNow()
    biometricRequest?.cancel()
    finishBiometric("cancelled")
    super.invalidate()
  }
}
