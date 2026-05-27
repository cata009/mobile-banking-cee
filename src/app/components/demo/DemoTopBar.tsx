/**
 * DemoTopBar Component
 * Professional demo header with product, country, scenario, release, and control panel access.
 */

import { useEffect, useRef, useState } from "react";
import { useNavigationContext } from "@/app/contexts/NavigationContext";
import { COUNTRIES, COUNTRY_META } from "@/app/registry/demoConfig";
import { PRODUCT_ORDER, PRODUCTS } from "@/app/registry/projectModel";
import { getReleaseBundle, RELEASE_ORDER } from "@/app/registry/releaseRegistry";
import { useDemo } from "@/app/state/demoStore";
import { DemoFeatureSidePanel } from "./DemoFeatureSidePanel";
import svgPaths from "@/imports/svg-pn3y56bdut";

export function DemoTopBar() {
  const {
    product,
    country,
    scenario,
    release,
    setProduct,
    setCountry,
    setScenario,
    setRelease,
  } = useDemo();
  const { currentScreen, navigateTo, setCoAppingActive } = useNavigationContext();

  const [isControlPanelOpen, setIsControlPanelOpen] = useState(false);
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [isReleaseDropdownOpen, setIsReleaseDropdownOpen] = useState(false);

  const productDropdownRef = useRef<HTMLDivElement>(null);
  const countryDropdownRef = useRef<HTMLDivElement>(null);
  const releaseDropdownRef = useRef<HTMLDivElement>(null);

  const selectedRelease = getReleaseBundle(release);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (productDropdownRef.current && !productDropdownRef.current.contains(event.target as Node)) {
        setIsProductDropdownOpen(false);
      }
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target as Node)) {
        setIsCountryDropdownOpen(false);
      }
      if (releaseDropdownRef.current && !releaseDropdownRef.current.contains(event.target as Node)) {
        setIsReleaseDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleReset = () => {
    setCoAppingActive(false);
    const targetScreen = scenario === "active" ? "prelogin-active" : "prelogin-inactive";
    navigateTo(targetScreen);
  };

  return (
    <>
      <div className="sticky top-0 z-[9999] bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-20 py-4">
          <div className="flex items-center gap-6">
            <div className="h-[27px] w-[140px] shrink-0">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 139.508 26.7899">
                <g>
                  <path clipRule="evenodd" d={svgPaths.p2cef6600} fill="#E2001A" fillRule="evenodd" />
                  <path clipRule="evenodd" d={svgPaths.p27e9da00} fill="#E2001A" fillRule="evenodd" />
                  <path clipRule="evenodd" d={svgPaths.p2e662b0} fill="white" fillRule="evenodd" />
                  <path d={svgPaths.p3d56e1f0} fill="#262626" />
                  <path d={svgPaths.p18a76220} fill="#262626" />
                  <path d={svgPaths.p2205fa00} fill="#262626" />
                  <path d={svgPaths.p4138200} fill="#262626" />
                  <path d={svgPaths.p120fd332} fill="#262626" />
                  <path d={svgPaths.p3558cb00} fill="#262626" />
                  <path d={svgPaths.p29646d00} fill="#262626" />
                  <path d={svgPaths.p3ed7ba20} fill="#262626" />
                  <path d={svgPaths.p4240280} fill="#262626" />
                </g>
              </svg>
            </div>

            <div className="relative" ref={productDropdownRef}>
              <button
                onClick={() => setIsProductDropdownOpen(!isProductDropdownOpen)}
                className="flex items-center gap-1 hover:opacity-70 transition-opacity"
              >
                <div className="flex flex-col gap-1 text-left">
                  <p className="font-['UniCredit:Regular',sans-serif] text-[14px] text-[#262626] leading-normal">
                    Application
                  </p>
                  <p className="font-['UniCredit:Bold',sans-serif] text-[14px] text-[#262626] leading-normal">
                    {PRODUCTS[product].label}
                  </p>
                </div>
                <svg className="w-6 h-6 shrink-0" fill="none" viewBox="0 0 24 24">
                  <path d={svgPaths.p12dc2d00} fill="#262626" />
                </svg>
              </button>

              {isProductDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-[10000] min-w-[190px] py-1">
                  {PRODUCT_ORDER.map((productId) => (
                    <button
                      key={productId}
                      aria-label={`${PRODUCTS[productId].label}${PRODUCTS[productId].status === "planned" ? " planned" : ""}`}
                      onClick={() => {
                        setProduct(productId);
                        setIsProductDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-2 text-sm text-left hover:bg-gray-50 transition-colors ${
                        product === productId
                          ? "bg-red-50 font-['UniCredit:Bold',sans-serif] text-[#E2001A]"
                          : "font-['UniCredit:Regular',sans-serif] text-[#262626]"
                      }`}
                    >
                      {PRODUCTS[productId].label}
                      {PRODUCTS[productId].status === "planned" && (
                        <span className="ml-2 text-xs text-gray-400">planned</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative" ref={countryDropdownRef}>
              <button
                onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                className="flex items-center gap-1 hover:opacity-70 transition-opacity"
              >
                <div className="flex flex-col gap-1 text-left">
                  <p className="font-['UniCredit:Regular',sans-serif] text-[14px] text-[#262626] leading-normal">
                    Country
                  </p>
                  <p className="font-['UniCredit:Bold',sans-serif] text-[14px] text-[#262626] leading-normal">
                    {COUNTRY_META[country]?.nameEN || country}
                  </p>
                </div>
                <svg className="w-6 h-6 shrink-0" fill="none" viewBox="0 0 24 24">
                  <path d={svgPaths.p12dc2d00} fill="#262626" />
                </svg>
              </button>

              {isCountryDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-[10000] min-w-[180px] py-1">
                  {COUNTRIES.map((countryCode) => (
                    <button
                      key={countryCode}
                      onClick={() => {
                        setCountry(countryCode);
                        setIsCountryDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-2 text-sm text-left hover:bg-gray-50 transition-colors ${
                        country === countryCode
                          ? "bg-red-50 font-['UniCredit:Bold',sans-serif] text-[#E2001A]"
                          : "font-['UniCredit:Regular',sans-serif] text-[#262626]"
                      }`}
                    >
                      {COUNTRY_META[countryCode]?.nameEN || countryCode}
                    </button>
                  ))}
                  <div className="my-1 border-t border-gray-200" />
                  <button
                    onClick={() => {
                      navigateTo("design-system");
                      setIsCountryDropdownOpen(false);
                    }}
                    className={`w-full px-4 py-2 text-sm text-left hover:bg-gray-50 transition-colors ${
                      currentScreen === "design-system"
                        ? "bg-red-50 font-['UniCredit:Bold',sans-serif] text-[#E2001A]"
                        : "font-['UniCredit:Regular',sans-serif] text-[#262626]"
                    }`}
                  >
                    Design system inventory
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center">
            <div className="bg-[#f5f5f5] flex gap-0.5 items-center px-1 py-0.5 rounded-[30px]">
              <button
                onClick={() => setScenario("active")}
                className={`px-3 py-1 rounded-[30px] transition-all ${
                  scenario === "active"
                    ? "bg-white font-['UniCredit:Bold',sans-serif] text-[16px] text-[#262626] leading-[18px]"
                    : "bg-transparent font-['UniCredit:Regular',sans-serif] text-[16px] text-[#666] leading-[18px]"
                }`}
              >
                Active App
              </button>
              <button
                onClick={() => setScenario("inactive")}
                className={`px-3 py-1 rounded-[30px] transition-all ${
                  scenario === "inactive"
                    ? "bg-white font-['UniCredit:Bold',sans-serif] text-[16px] text-[#262626] leading-[18px]"
                    : "bg-transparent font-['UniCredit:Regular',sans-serif] text-[16px] text-[#666] leading-[18px]"
                }`}
              >
                Inactive App
              </button>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative" ref={releaseDropdownRef}>
              <button
                onClick={() => setIsReleaseDropdownOpen(!isReleaseDropdownOpen)}
                className="flex items-center gap-1 hover:opacity-70 transition-opacity"
              >
                <div className="flex flex-col gap-1 text-left">
                  <p className="font-['UniCredit:Regular',sans-serif] text-[14px] text-[#262626] leading-normal">
                    Release
                  </p>
                  <p className="font-['UniCredit:Bold',sans-serif] text-[14px] text-[#262626] leading-normal">
                    {selectedRelease.label}
                  </p>
                </div>
                <svg className="w-6 h-6 shrink-0" fill="none" viewBox="0 0 24 24">
                  <path d={svgPaths.p12dc2d00} fill="#262626" />
                </svg>
              </button>

              {isReleaseDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-[10000] min-w-[170px] py-1">
                  {RELEASE_ORDER.map((releaseId) => (
                    <button
                      key={releaseId}
                      onClick={() => {
                        setRelease(releaseId);
                        setIsReleaseDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-2 text-sm text-left hover:bg-gray-50 transition-colors ${
                        release === releaseId
                          ? "bg-red-50 font-['UniCredit:Bold',sans-serif] text-[#E2001A]"
                          : "font-['UniCredit:Regular',sans-serif] text-[#262626]"
                      }`}
                    >
                      {getReleaseBundle(releaseId).label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setIsControlPanelOpen(!isControlPanelOpen)}
              className={`w-6 h-6 transition-colors ${
                isControlPanelOpen ? "text-[#E2001A]" : "text-[#262626] hover:text-[#E2001A]"
              }`}
              title="Control Panel"
            >
              <svg className="block size-full" fill="none" viewBox="0 0 24 24">
                <path clipRule="evenodd" d={svgPaths.p2284a880} fill="currentColor" fillRule="evenodd" />
              </svg>
            </button>

            <button
              onClick={handleReset}
              className="w-6 h-6 text-[#262626] hover:text-[#E2001A] transition-colors"
              title="Reset to Prelogin"
            >
              <svg className="block size-full" fill="none" viewBox="0 0 24 24">
                <g>
                  <path d={svgPaths.p2192be00} fill="currentColor" />
                  <path d={svgPaths.p2e463400} fill="currentColor" />
                </g>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <DemoFeatureSidePanel
        isOpen={isControlPanelOpen}
        onClose={() => setIsControlPanelOpen(false)}
      />
    </>
  );
}
