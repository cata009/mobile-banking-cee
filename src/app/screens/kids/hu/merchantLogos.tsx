/**
 * HU Kids merchant logo marks.
 *
 * Kids-local vector placeholders standing in for an Ethoca-style merchant logo
 * feed. Extracted verbatim from KidsMarketHomeApp.tsx (kids-split Phase 3).
 */
import type { HuMerchantLogoId } from "./types";

export function HuMerchantLogo({ merchant }: { merchant: "mcdonalds" }) {
  if (merchant === "mcdonalds") {
    return (
      <span
        aria-label="McDonalds merchant logo"
        className="relative grid size-[34px] shrink-0 place-items-center overflow-hidden rounded-full bg-[#DB0007] shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--uc-static-white)_24%,transparent)]"
        role="img"
      >
        <span className="absolute bottom-[6px] left-[7px] h-[19px] w-[8px] rounded-t-full border-l-[3px] border-r-[3px] border-t-[3px] border-[#FFC72C]" />
        <span className="absolute bottom-[6px] right-[7px] h-[19px] w-[8px] rounded-t-full border-l-[3px] border-r-[3px] border-t-[3px] border-[#FFC72C]" />
        <span className="absolute bottom-[6px] h-[15px] w-[4px] rounded-t-full bg-[#FFC72C]" />
      </span>
    );
  }

  return null;
}

export function HuMerchantLogoMark({ merchant }: { merchant: HuMerchantLogoId }) {
  if (merchant === "mcdonalds") {
    return (
      <span
        aria-label="McDonalds merchant logo"
        className="grid size-[34px] shrink-0 place-items-center overflow-hidden rounded-full bg-[#DA291C] text-[#FFC72C] shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--uc-static-white)_28%,transparent)]"
        role="img"
      >
        {/* Simple Icons: McDonald's — CC0 */}
        <svg aria-hidden="true" className="h-[20px] w-[20px]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.243 3.006c2.066 0 3.742 8.714 3.742 19.478H24c0-11.588-3.042-20.968-6.766-20.968-2.127 0-4.007 2.81-5.248 7.227-1.241-4.416-3.121-7.227-5.231-7.227C3.031 1.516 0 10.888 0 22.476h3.014c0-10.763 1.658-19.47 3.724-19.47 2.066 0 3.741 8.05 3.741 17.98h2.997c0-9.93 1.684-17.98 3.75-17.98Z" />
        </svg>
      </span>
    );
  }

  if (merchant === "youtube") {
    return (
      <span
        aria-label="YouTube merchant logo"
        className="grid size-[34px] shrink-0 place-items-center overflow-hidden rounded-full bg-[#FF0000] text-[var(--uc-static-white)] shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--uc-static-white)_24%,transparent)]"
        role="img"
      >
        {/* Simple Icons: YouTube — CC0 */}
        <svg aria-hidden="true" className="h-[18px] w-[18px]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      </span>
    );
  }

  if (merchant === "spotify") {
    return (
      <span
        aria-label="Spotify merchant logo"
        className="grid size-[34px] shrink-0 place-items-center overflow-hidden rounded-full bg-[#1DB954] text-[var(--uc-static-black)] shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--uc-static-white)_24%,transparent)]"
        role="img"
      >
        {/* Simple Icons: Spotify — CC0 */}
        <svg aria-hidden="true" className="h-[18px] w-[18px]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z" />
        </svg>
      </span>
    );
  }

  if (merchant === "netflix") {
    return (
      <span
        aria-label="Netflix merchant logo"
        className="grid size-[34px] shrink-0 place-items-center overflow-hidden rounded-full bg-[#E50914] text-[var(--uc-static-white)] shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--uc-static-white)_24%,transparent)]"
        role="img"
      >
        {/* Simple Icons: Netflix — CC0 */}
        <svg aria-hidden="true" className="h-[16px] w-[16px]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M5.398.032v23.936L17.34 24V0L5.398.032zm9.044 16.728l-1.915.026-.013-3.287L11.224 17.3l-1.155-.026c-.046-.197-.052-.291 0-.394.81-1.723 1.619-3.446 2.429-5.169l.013-2.781-2.043 4.442-2.215.026V7.46l2.193-.026.013 3.377c.595-1.295 1.19-2.59 1.785-3.886l1.915-.026-.013 9.887c0 .022-.444.022-.444.022z" />
        </svg>
      </span>
    );
  }

  if (merchant === "steam") {
    return (
      <span
        aria-label="Steam merchant logo"
        className="grid size-[34px] shrink-0 place-items-center overflow-hidden rounded-full bg-[#1B2838] text-[var(--uc-static-white)] shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--uc-static-white)_24%,transparent)]"
        role="img"
      >
        {/* Simple Icons: Steam — CC0 */}
        <svg aria-hidden="true" className="h-[18px] w-[18px]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 11.999-5.373 11.999-12S18.605 0 11.979 0zM7.54 18.21l-1.473-.61c.262.543.714.999 1.314 1.25 1.297.539 2.793-.076 3.332-1.375.263-.63.264-1.319.005-1.949s-.75-1.121-1.377-1.383c-.624-.26-1.29-.249-1.878-.03l1.523.63c.956.4 1.409 1.5 1.009 2.455-.397.957-1.497 1.41-2.454 1.012H7.54zm11.415-9.303c0-1.662-1.353-3.015-3.015-3.015-1.665 0-3.015 1.353-3.015 3.015 0 1.665 1.35 3.015 3.015 3.015 1.663 0 3.015-1.35 3.015-3.015zm-5.273-.005c0-1.252 1.013-2.266 2.265-2.266 1.249 0 2.266 1.014 2.266 2.266 0 1.251-1.017 2.265-2.266 2.265-1.252 0-2.265-1.014-2.265-2.265z" />
        </svg>
      </span>
    );
  }

  if (merchant === "amazon") {
    return (
      <span
        aria-label="Amazon merchant logo"
        className="grid size-[34px] shrink-0 place-items-center overflow-hidden rounded-full bg-[#232F3E] text-[#FF9900] shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--uc-static-white)_24%,transparent)]"
        role="img"
      >
        {/* Simple Icons: Amazon — CC0 */}
        <svg aria-hidden="true" className="h-[18px] w-[18px]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M.045 18.02c.072-.116.183-.128.309-.072 2.812 1.268 5.967 2.016 9.209 2.016 2.456 0 4.984-.467 7.316-1.467.107-.044.221-.084.301-.084.243 0 .443.193.443.434 0 .165-.087.328-.256.428-2.033 1.084-4.516 1.801-7.504 1.801-3.668 0-7.064-1.137-9.656-2.848-.061-.044-.103-.103-.103-.18 0-.044.018-.087.041-.116v-.112zm10.512-9.428c0-.553.018-1.005-.243-1.479-.213-.394-.587-.633-.992-.633-.276 0-.568.149-.568.467 0 .521.725.596 1.064 1.005.353.401.439.947.439 1.459v7.848c0 .529.243.848.701.848.428 0 .595-.328.595-.848V8.592h.004zm7.144 1.005c-.394 0-.724.243-.724.633 0 .394.428.553.701.805.388.353.516.764.516 1.281v4.287c0 .508.221.848.701.848.428 0 .595-.328.595-.848V12.04c0-.717-.394-1.281-.947-1.652-.343-.227-.624-.336-.848-.336-.18 0-.328.137-.328.328v.216h-.166zm-3.696.052c-.328 0-.553.137-.553.467 0 .394.428.553.701.805.388.353.516.764.516 1.281v4.287c0 .508.221.848.701.848.428 0 .595-.328.595-.848V12.04c0-.717-.394-1.281-.947-1.652-.343-.227-.624-.336-.848-.336-.18 0-.328.137-.328.328v.216h-.137zm-2.548 1.296c-.353-.32-.624-.516-1.005-.516-.276 0-.516.137-.516.467 0 .394.428.553.701.805.388.353.516.764.516 1.281v3.716c0 .508.221.848.701.848.428 0 .595-.328.595-.848v-3.716c0-.717-.394-1.281-.947-1.652l.255.116zm-5.616-.553c-.353-.32-.624-.516-1.005-.516-.276 0-.516.137-.516.467 0 .394.428.553.701.805.388.353.516.764.516 1.281v3.716c0 .508.221.848.701.848.428 0 .595-.328.595-.848v-3.716c0-.717-.394-1.281-.947-1.652l.255.116zm17.748 4.924c-.256-.336-.848-.336-1.268-.336-3.668 0-8.064-1.137-10.656-2.848-.061-.044-.103-.103-.103-.18 0-.044.018-.087.041-.116.072-.116.183-.128.309-.072 2.812 1.268 5.967 2.016 9.209 2.016 1.281 0 2.548-.128 3.716-.336.116-.018.213-.027.301-.027.243 0 .443.193.443.434 0 .165-.087.328-.256.428l-.001.116z" />
        </svg>
      </span>
    );
  }

  if (merchant === "roblox") {
    return (
      <span
        aria-label="Roblox merchant logo"
        className="grid size-[34px] shrink-0 place-items-center overflow-hidden rounded-full bg-[var(--uc-static-white)] text-[#E2231A] shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--uc-static-black)_18%,transparent)]"
        role="img"
      >
        {/* Simple Icons: Roblox — CC0 */}
        <svg aria-hidden="true" className="h-[18px] w-[18px]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.267.012c-.633.046-1.226.252-1.767.595a3.845 3.845 0 0 0-1.214 1.343c-.285.552-.42 1.137-.395 1.751.026.62.193 1.18.503 1.686a3.747 3.747 0 0 0 1.248 1.214c.524.31 1.086.479 1.686.504.613.025 1.194-.108 1.743-.398a3.85 3.85 0 0 0 1.345-1.226c.345-.555.523-1.154.533-1.793a3.729 3.729 0 0 0-.521-1.924A3.847 3.847 0 0 0 14.064.42 3.784 3.784 0 0 0 12.267.012zm-.398 5.783a1.832 1.832 0 0 1-1.382-.71 1.83 1.83 0 0 1-.346-1.494c.075-.43.29-.79.642-1.079a1.83 1.83 0 0 1 1.196-.413l6.847 1.828-.832 3.102-6.846-1.832a1.84 1.84 0 0 1-.68.278c-.073.013-.234.045-.28.043l.683-.045.198.272zm9.236 4.087a1.832 1.832 0 0 0-2.226-1.326l-13.61 3.646a1.832 1.832 0 0 0-1.326 2.226l1.833 6.834a1.832 1.832 0 0 0 2.226 1.326l13.61-3.646a1.832 1.832 0 0 0 1.326-2.226l-1.833-6.834zm-7.39 5.745l-3.403-3.402 3.403-.911.91 3.403-.91.91z" />
        </svg>
      </span>
    );
  }

  if (merchant === "tesco") {
    return (
      <span
        aria-label="Tesco merchant logo"
        className="grid size-[34px] shrink-0 place-items-center overflow-hidden rounded-full bg-[#00539F] text-[var(--uc-static-white)] shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--uc-static-white)_24%,transparent)]"
        role="img"
      >
        {/* Simple Icons: Tesco — CC0 (wordmark dot) */}
        <svg aria-hidden="true" className="h-[18px] w-[18px]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M0 6.94v3.95h4.46v-1.2H1.43V6.94H0zm5.5 0v3.95h1.43V6.94H5.5zm2.5 0v3.95h1.43V6.94H8zm2.43 0v1.2h1.3v2.75h1.43V8.14h1.3v-1.2h-4.03zm4.93 0v3.95h1.43V6.94h-1.43zm2.49 0v3.95h3.04v-1.2h-1.61V6.94h-1.43zm3.91 0v3.95h1.43V6.94h-1.43zM1.43 13.06c-.79 0-1.43.64-1.43 1.43 0 .79.64 1.43 1.43 1.43.79 0 1.43-.64 1.43-1.43 0-.79-.64-1.43-1.43-1.43z" />
        </svg>
      </span>
    );
  }

  if (merchant === "ikea") {
    return (
      <span
        aria-label="IKEA merchant logo"
        className="grid size-[34px] shrink-0 place-items-center overflow-hidden rounded-full bg-[#0058A3] text-[#FFDA1A] shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--uc-static-white)_24%,transparent)]"
        role="img"
      >
        {/* Simple Icons: IKEA — CC0 */}
        <svg aria-hidden="true" className="h-[16px] w-[16px]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M0 3.458v17.084h24V3.458H0zm2.4 2.4h19.2v12.284H2.4V5.858zm3.6 2.4v7.484h3.6V14.3H8.4V8.658H9.6v3.142h2.4V8.658h1.2v5.642H6V8.258zm7.2 0v7.084h4.8v-1.2H16.8V8.658h1.2v3.142h2.4V8.658h1.2v5.642h-6V8.258z" />
        </svg>
      </span>
    );
  }

  if (merchant === "nintendo") {
    return (
      <span
        aria-label="Nintendo merchant logo"
        className="grid size-[34px] shrink-0 place-items-center overflow-hidden rounded-full bg-[#E60012] text-[var(--uc-static-white)] shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--uc-static-white)_24%,transparent)]"
        role="img"
      >
        {/* Simple Icons: Nintendo — CC0 */}
        <svg aria-hidden="true" className="h-[18px] w-[18px]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M0 6.4v11.2c0 1.18.96 2.13 2.14 2.13h19.72c1.18 0 2.14-.95 2.14-2.13V6.4c0-1.18-.96-2.13-2.14-2.13H2.14C.96 4.27 0 5.22 0 6.4zm9.1 1.56h4.32L8.7 16.04H4.38L9.1 7.96zm5.43 0h4.32l-4.72 8.08H9.81l4.72-8.08zm-12.3.2h2.66L4.7 11.9 2.23 8.16zm1.34 1.27l1.41 2.16H2.46l1.11-2.16z" />
        </svg>
      </span>
    );
  }

  if (merchant === "playstation") {
    return (
      <span
        aria-label="PlayStation merchant logo"
        className="grid size-[34px] shrink-0 place-items-center overflow-hidden rounded-full bg-[#003791] text-[var(--uc-static-white)] shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--uc-static-white)_24%,transparent)]"
        role="img"
      >
        {/* Simple Icons: PlayStation — CC0 */}
        <svg aria-hidden="true" className="h-[18px] w-[18px]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9.5 0v17.857l3.857 1.252V5.651c0-.815.366-1.366.96-1.158.766.218 1.149 1.4.813 2.42-.028.073-.052.146-.085.218-.354.78-1.298 1.51-2.42 1.95v2.55c1.55.087 3.122-.328 4.287-1.158 1.346-.96 2.073-2.45 2.073-4.286 0-1.95-.802-3.503-2.42-4.49C14.495.434 11.69-.05 9.5 0zm-3.857 22.962c-2.143-.354-3.36-1.215-3.857-2.42-.43-1.04.043-1.966 1.158-2.42.927-.379 2.107-.354 3.214-.043v2.06c-.857-.354-1.857-.379-2.42-.043-.354.218-.354.564 0 .732.732.43 2.06.43 3.214.043.043-.014.087-.03.13-.043v2.06c-.43.13-.857.218-1.44.077z" />
        </svg>
      </span>
    );
  }

  // Default: apple — Simple Icons: Apple — CC0
  return (
    <span
      aria-label="Apple merchant logo"
      className="grid size-[34px] shrink-0 place-items-center overflow-hidden rounded-full bg-[var(--uc-static-black)] text-[var(--uc-static-white)] shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--uc-static-white)_18%,transparent)]"
      role="img"
    >
      <svg aria-hidden="true" className="h-[20px] w-[20px]" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
      </svg>
    </span>
  );
}
