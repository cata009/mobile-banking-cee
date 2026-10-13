param(
  [string]$BuildRoot,
  [string]$Destination,
  [string]$OtaBaseURL,
  [switch]$FreshKotlin,
  [ValidateSet('armeabi-v7a', 'arm64-v8a', 'x86', 'x86_64')]
  [string[]]$Architectures = @('armeabi-v7a', 'arm64-v8a', 'x86', 'x86_64')
)
$ErrorActionPreference = 'Stop'
$nativeRepo = (Resolve-Path (Join-Path $PSScriptRoot '../..')).Path
$nativeTools = Join-Path $nativeRepo '.codex-temp/android-spike'
$nativeDestination = if ($Destination) { [IO.Path]::GetFullPath($Destination) } else { Join-Path $nativeRepo 'public/downloads/mobile-banking-cee-native-0.3.0.apk' }
if (!$nativeDestination.StartsWith($nativeRepo + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) { throw 'APK output must stay inside the current checkout.' }
if ($OtaBaseURL) {
  $nativeOtaUri = [Uri]$OtaBaseURL
  if (!$nativeOtaUri.IsAbsoluteUri -or ($nativeOtaUri.Scheme -ne 'https' -and !($nativeOtaUri.Scheme -eq 'http' -and $nativeOtaUri.Host -in @('localhost','127.0.0.1')))) { throw 'OTA URL requires HTTPS; HTTP is allowed only for loopback proof.' }
  $nativePublic = [IO.Path]::GetFullPath((Join-Path $nativeRepo 'public')) + [IO.Path]::DirectorySeparatorChar
  if ($nativeOtaUri.Host -in @('localhost','127.0.0.1') -and (!$Destination -or $nativeDestination.StartsWith($nativePublic, [StringComparison]::OrdinalIgnoreCase))) { throw 'Loopback OTA builds require an explicit private proof output outside public.' }
}
if (!$env:JAVA_HOME -and (Test-Path "$nativeTools/jdk")) {
  $env:JAVA_HOME = (Get-ChildItem "$nativeTools/jdk" -Directory | Select-Object -First 1).FullName
}
if (!$env:ANDROID_HOME) { $env:ANDROID_HOME = "$nativeTools/sdk" }
$env:ANDROID_SDK_ROOT = $env:ANDROID_HOME
$env:PATH = "$env:JAVA_HOME/bin;$env:PATH"
if (!$env:ANDROID_DEMO_KEYSTORE -and (Test-Path "$nativeTools/signing-local.json")) {
  $nativeKey = Get-Content "$nativeTools/signing-local.json" -Raw | ConvertFrom-Json
  $env:ANDROID_DEMO_KEYSTORE = "$nativeTools/demo-signing.jks"
  $env:ANDROID_DEMO_STORE_PASSWORD = $nativeKey.storePassword
  $env:ANDROID_DEMO_KEY_PASSWORD = $nativeKey.keyPassword
}
foreach ($required in @('JAVA_HOME','ANDROID_HOME','ANDROID_DEMO_KEYSTORE','ANDROID_DEMO_STORE_PASSWORD','ANDROID_DEMO_KEY_PASSWORD')) {
  if (![Environment]::GetEnvironmentVariable($required)) { throw "Missing build environment variable: $required" }
}
if (!$BuildRoot) {
  $nativeShort = Get-Item 'C:/mb-cee' -ErrorAction SilentlyContinue
  $BuildRoot = if ($nativeShort -and $nativeShort.Target -eq $nativeRepo) {'C:/mb-cee'} else {$nativeRepo}
}
$nativeProject = Join-Path $BuildRoot 'native-spike'
# NDK/linker also needs the SDK path without spaces on Windows.
foreach ($nativeVariable in @('ANDROID_HOME', 'JAVA_HOME')) {
  $nativePath = [Environment]::GetEnvironmentVariable($nativeVariable)
  if ($nativePath.StartsWith($nativeRepo + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase) -or $nativePath.StartsWith($nativeRepo + '/', [StringComparison]::OrdinalIgnoreCase)) {
    [Environment]::SetEnvironmentVariable($nativeVariable, $BuildRoot + $nativePath.Substring($nativeRepo.Length), 'Process')
  }
}
$env:ANDROID_SDK_ROOT = $env:ANDROID_HOME
$env:PATH = "$env:JAVA_HOME/bin;$env:PATH"
if (!(Test-Path "$nativeProject/node_modules/react-native/package.json")) { throw 'Run npm ci inside native-spike first.' }
& node (Join-Path $nativeRepo 'scripts/native-spike/fidelity/check-reference.mjs')
if ($LASTEXITCODE -ne 0) { throw 'Frozen Italy UI references changed; review the native mapping before building.' }
& node (Join-Path $nativeRepo 'scripts/native-spike/ota/verify-runtime.mjs')
if ($LASTEXITCODE -ne 0) { throw 'Native compatibility/signing metadata is stale; regenerate it before building.' }
Push-Location "$nativeProject/android"
try {
  $nativeGradleArgs = @('assembleRelease', "-PreactNativeArchitectures=$($Architectures -join ',')", '--console=plain')
  if ($FreshKotlin) { $nativeGradleArgs += '-Pkotlin.incremental=false' }
  if ($OtaBaseURL) {
    $nativeGradleArgs += "-PnativeOtaBaseUrl=$OtaBaseURL"
  }
  & './gradlew.bat' @nativeGradleArgs
  if ($LASTEXITCODE -ne 0) { throw 'Native Android release build failed.' }
} finally { Pop-Location }
$nativeApk = Join-Path $nativeProject 'android/app/build/outputs/apk/release/app-release.apk'
$nativeSigner = Get-ChildItem "$env:ANDROID_HOME/build-tools/*/apksigner.bat" | Sort-Object FullName -Descending | Select-Object -First 1
if (!$nativeSigner) { throw 'Android build-tools/apksigner missing.' }
& $nativeSigner.FullName verify --print-certs $nativeApk
if ($LASTEXITCODE -ne 0) { throw 'APK signature verification failed.' }
New-Item -ItemType Directory -Force (Split-Path $nativeDestination) | Out-Null
Copy-Item -LiteralPath $nativeApk -Destination $nativeDestination -Force
Write-Output "Signed native APK: $nativeDestination"
Write-Output "SHA256: $((Get-FileHash $nativeDestination -Algorithm SHA256).Hash)"
