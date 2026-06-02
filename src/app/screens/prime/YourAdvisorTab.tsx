/**
 * YourAdvisorTab Component
 * Displays advisor information with contact details
 */

import { useLanguage } from '@/app/contexts/LanguageContext';
import { PrimeLabelValue } from '@/app/components/prime/PrimeLabelValue';
import { AppIcon } from "@/app/components/icons";
import { PrimeDiamondMark } from "@/app/components/prime/PrimeDiamondMark";
import imgAdvisorImage from "figma:asset/e693dd6eed452da6c4cda0e69dbdd3f45039c9f2.png";

export function YourAdvisorTab() {
  const { t } = useLanguage();

  const handleCallNow = () => {
    console.log('📞 Call now clicked');
    // Future: window.location.href = `tel:${t('prime.advisor.phone')}`;
  };

  const handleSendEmail = () => {
    console.log('✉️ Send email clicked');
    // Future: window.location.href = `mailto:${t('prime.advisor.emailAddress')}`;
  };

  return (
    <div className="flex flex-col gap-[24px] w-full">
      {/* Intro Text */}
      <p className="font-['UniCredit:Regular',sans-serif] leading-[normal] not-italic text-[18px] text-[var(--uc-static-white)] whitespace-pre-wrap">
        {t('prime.advisor.introText')}
      </p>

      {/* Advisor Details Card */}
      <div className="bg-[color-mix(in_srgb,var(--uc-static-white)_10%,transparent)] content-stretch flex flex-col gap-[16px] items-start p-[16px] relative rounded-[16px] shrink-0 w-full">
        {/* Advisor Header with Photo */}
        <div className="content-stretch flex gap-[16px] items-center relative shrink-0 w-full">
          {/* Advisor Image */}
          <div className="relative rounded-[100px] shrink-0 size-[64px]">
            <img 
              alt={t('prime.advisor.name')} 
              className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[100px] size-full" 
              src={imgAdvisorImage} 
            />
          </div>

          {/* Advisor Name */}
          <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] h-full items-start justify-center leading-[normal] min-h-px min-w-px not-italic relative text-[16px] text-[var(--uc-static-white)] whitespace-pre-wrap">
            <p className="font-['UniCredit:Bold',sans-serif] relative shrink-0 w-full">
              {t('prime.advisor.yourAdvisor')}
            </p>
            <p className="font-['UniCredit:Regular',sans-serif] relative shrink-0 w-full">
              {t('prime.advisor.name')}
            </p>
          </div>
        </div>

        {/* Phone Number */}
        <div className="content-stretch flex items-center justify-center relative shrink-0 w-full">
          <PrimeLabelValue 
            label={t('prime.advisor.phoneNumber')} 
            value={t('prime.advisor.phone')} 
          />
        </div>

        {/* Email */}
        <div className="content-stretch flex items-center justify-center relative shrink-0 w-full">
          <PrimeLabelValue 
            label={t('prime.advisor.email')} 
            value={t('prime.advisor.emailAddress')} 
          />
        </div>

        {/* Branch Name */}
        <div className="content-stretch flex items-center justify-center relative shrink-0 w-full">
          <PrimeLabelValue 
            label={t('prime.advisor.branchName')} 
            value={t('prime.advisor.branch')} 
          />
        </div>

        {/* Branch Address with Direction Icon */}
        <div className="content-stretch flex gap-[16px] items-center justify-center relative shrink-0 w-full">
          <PrimeLabelValue 
            label={t('prime.advisor.branchAddress')} 
            value={t('prime.advisor.address')} 
          />
          
          {/* Direction Icon - Native SVG from Figma */}
          <button className="relative shrink-0 size-[32px] cursor-pointer hover:opacity-70 transition-opacity">
            <AppIcon name="prime-direction" color="var(--uc-static-white)" />
          </button>
        </div>

        {/* Contact Buttons */}
        <div className="content-stretch flex gap-[16px] items-start relative shrink-0 w-full">
          {/* Call Now Button */}
          <button
            onClick={handleCallNow}
            className="bg-[color-mix(in_srgb,var(--uc-static-white)_10%,transparent)] flex-[1_0_0] min-h-[124px] min-w-px relative rounded-[16px] cursor-pointer hover:bg-[color-mix(in_srgb,var(--uc-static-white)_15%,transparent)] transition-colors"
          >
            <div className="flex flex-col items-center justify-center min-h-[inherit] size-full">
              <div className="content-stretch flex flex-col gap-[16px] items-center justify-center min-h-[inherit] px-[4px] py-[24px] relative w-full">
                {/* Phone Icon - Native SVG from Figma */}
                <div className="grid h-[32px] w-[32px] shrink-0 place-items-center">
                  <AppIcon name="prime-phone" color="var(--uc-static-white)" />
                </div>

                {/* Button Text */}
                <p className="flex-[1_0_0] font-['UniCredit:Medium',sans-serif] leading-[16px] min-h-px min-w-px not-italic relative text-[14px] text-center text-[var(--uc-static-white)] whitespace-pre-wrap max-w-[79px]">
                  {t('prime.advisor.callNow')}
                </p>
              </div>
            </div>
          </button>

          {/* Send Email Button */}
          <button
            onClick={handleSendEmail}
            className="bg-[color-mix(in_srgb,var(--uc-static-white)_10%,transparent)] flex-[1_0_0] min-h-[124px] min-w-px relative rounded-[16px] cursor-pointer hover:bg-[color-mix(in_srgb,var(--uc-static-white)_15%,transparent)] transition-colors"
          >
            <div className="flex flex-col items-center justify-center min-h-[inherit] size-full">
              <div className="content-stretch flex flex-col gap-[16px] items-center justify-center min-h-[inherit] px-[4px] py-[24px] relative w-full">
                {/* Email Icon - Native SVG from Figma */}
                <div className="grid h-[32px] w-[32px] shrink-0 place-items-center">
                  <AppIcon name="prime-email" color="var(--uc-static-white)" />
                </div>

                {/* Button Text */}
                <p className="flex-[1_0_0] font-['UniCredit:Medium',sans-serif] leading-[16px] min-h-px min-w-px not-italic relative text-[14px] text-center text-[var(--uc-static-white)] whitespace-pre-wrap max-w-[79px]">
                  {t('prime.advisor.sendEmail')}
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* Availability Text */}
        <p className="font-['UniCredit:Regular',sans-serif] leading-[normal] min-w-full not-italic relative shrink-0 text-[14px] text-center text-[var(--uc-static-white)] w-[min-content] whitespace-pre-wrap">
          {t('prime.advisor.availability')}
        </p>
      </div>

      {/* Prime Logo */}
      <div className="content-stretch flex items-center justify-center relative shrink-0 w-full">
        <div className="content-stretch flex flex-col gap-[2.603px] items-start relative shrink-0">
          <div className="content-stretch flex gap-[2.603px] items-center relative shrink-0">
            <p className="font-['UniCredit:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[18.223px] text-[var(--uc-static-white)]">Prime</p>
            <div className="relative shrink-0 size-[15px] mt-[2.603px]">
              <PrimeDiamondMark color="var(--uc-static-white)" size={15} />
            </div>
            <p className="font-['UniCredit:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[13.016px] text-[var(--uc-static-white)]">by</p>
          </div>
          {/* UniCredit Logo - Native SVG from Figma */}
          <div className="h-[9.762px] relative shrink-0 w-[75.604px]">
            <svg xmlns="http://www.w3.org/2000/svg" width="76" height="10" viewBox="0 0 76 10" fill="none">
              <path d="M4.97423 2.60706C4.97423 2.60706 4.97423 2.58046 5.05403 2.47406C5.13383 2.36766 5.10723 2.28786 5.05403 2.23466C5.02743 2.20806 4.25602 1.75585 4.25602 1.75585C4.20282 1.72925 4.17622 1.64945 4.17622 1.59625C4.17622 1.48985 4.25602 1.41005 4.38903 1.35685C4.86783 1.22385 6.59684 1.14405 7.18204 1.14405C7.36824 1.14405 7.68745 1.14405 7.98005 1.14405C8.00665 1.14405 8.00665 1.14405 8.00665 1.14405C7.15544 0.425847 6.06484 0.000244141 4.86783 0.000244141C2.18121 0.000244141 0 2.18146 0 4.86807C0 6.03848 0.425602 7.12909 1.11721 7.98029C1.72901 7.07589 3.24522 4.94787 3.56442 4.49567C3.96342 3.91047 4.97423 2.60706 4.97423 2.60706Z" fill="var(--uc-brand)"/>
              <path d="M9.33625 2.92585C9.57565 2.68645 9.73525 2.47365 9.70865 2.28745C9.68205 1.78205 9.07024 1.38305 9.07024 1.38305C9.07024 1.38305 9.07024 1.38305 9.04364 1.35645C9.07024 1.38305 9.09684 1.40965 9.12344 1.46285C9.28305 1.83525 9.01704 2.07465 8.85744 2.23425C8.77764 2.31405 7.52744 3.48446 6.06443 4.76127C4.78762 5.87847 3.35121 7.02228 2.50001 7.66068C1.3296 8.53849 1.0902 8.67149 1.0902 8.67149C1.0636 8.69809 1.0104 8.69809 0.957197 8.69809C0.877397 8.69809 0.824196 8.64489 0.770996 8.59169C0.770996 8.61829 0.770996 8.69809 0.877397 8.83109L0.930597 8.88429C1.0104 8.96409 1.1168 9.09709 1.2764 9.20349C1.5158 9.41629 1.6222 9.30989 2.1276 8.93749C2.89901 9.44289 3.83001 9.76209 4.84082 9.76209C7.52744 9.76209 9.70865 7.58088 9.70865 4.89427C9.76185 4.17606 9.60225 3.51106 9.33625 2.92585Z" fill="var(--uc-brand)"/>
              <path fillRule="evenodd" clipRule="evenodd" d="M5.05434 2.47411C5.13414 2.36771 5.10754 2.28791 5.05434 2.23471C5.02774 2.20811 4.25634 1.75591 4.25634 1.75591C4.20314 1.72931 4.17654 1.64951 4.17654 1.59631C4.17654 1.48991 4.25634 1.41011 4.38934 1.35691C4.86814 1.2239 6.59715 1.1441 7.18235 1.1441C7.44836 1.1441 8.00696 1.1441 8.35276 1.1707C8.75176 1.1973 9.07097 1.2771 9.12417 1.46331C9.28377 1.83571 9.01777 2.07511 8.85816 2.23471C8.77836 2.31451 7.52816 3.48492 6.06515 4.76172C4.78834 5.87893 3.35193 7.02274 2.50073 7.66114C1.33032 8.53895 1.09092 8.67195 1.09092 8.67195C1.06432 8.69855 1.01112 8.69855 0.957918 8.69855C0.824918 8.69855 0.745117 8.61875 0.745117 8.48575C0.745117 8.43255 0.771717 8.40595 0.771717 8.35275C0.771717 8.35275 3.08593 5.02773 3.48493 4.46912C3.91054 3.91052 4.92134 2.60711 4.92134 2.60711C4.92134 2.60711 4.97454 2.58051 5.05434 2.47411Z" fill="var(--uc-static-white)"/>
              <path d="M17.4755 0.74469V6.83613C17.4755 8.16613 16.3051 9.20354 14.7357 9.20354C13.1929 9.20354 11.9958 8.19273 11.9958 6.83613V2.1811C11.9958 1.38309 12.6343 0.74469 13.4057 0.74469H13.5121V6.83613C13.5121 7.55433 14.1505 8.00653 14.7889 8.00653C15.4007 8.00653 16.0391 7.60753 16.0391 6.83613V2.1013C16.0391 1.35649 16.6509 0.74469 17.3957 0.74469H17.4755V0.74469Z" fill="var(--uc-static-white)"/>
              <path d="M20.4819 2.89966C22.5567 2.89966 22.8759 4.07007 22.8759 4.76167V9.09749H22.8227C22.0513 9.09749 21.4129 8.45909 21.4129 7.68769V4.76167C21.4129 4.36267 21.2533 3.85726 20.4287 3.85726C20.0563 3.85726 19.8169 3.91046 19.5775 3.99026C19.5775 4.09667 19.5775 9.07089 19.5775 9.07089H18.0879V3.32526C18.7263 3.05926 19.7637 2.89966 20.4819 2.89966Z" fill="var(--uc-static-white)"/>
              <path d="M25.0039 7.71442C25.0039 8.48582 24.3918 9.12457 23.5938 9.12457H23.541V2.89996H25.0039V7.71442ZM24.2861 0.74469C24.7383 0.744712 25.084 1.09082 25.084 1.48981C25.0837 1.88859 24.7381 2.20756 24.2861 2.20758C23.8341 2.20758 23.4885 1.88861 23.4883 1.48981C23.4617 1.0642 23.8339 0.74469 24.2861 0.74469Z" fill="var(--uc-static-white)"/>
              <path d="M29.2336 0.612305C29.9252 0.612305 30.5902 0.771906 31.1222 1.09111V2.55412C30.7764 2.12851 30.3242 1.80931 29.5528 1.80931C28.0365 1.80931 27.1055 3.29892 27.1055 4.84173C27.1055 6.30474 28.0897 7.87415 29.5528 7.87415C30.1912 7.87415 30.7764 7.68795 31.1222 7.20914V8.64555C30.6966 8.96475 30.005 9.15096 29.207 9.15096C26.8129 9.15096 25.5361 6.94314 25.5361 4.84173C25.5627 2.79352 26.8395 0.612305 29.2336 0.612305Z" fill="var(--uc-static-white)"/>
              <path d="M33.7557 2.90002C33.9951 2.90002 34.3143 2.92662 34.5803 2.95322V4.15023C34.0749 3.77783 33.3833 3.91083 33.0907 4.07043V7.71465C33.0907 8.48606 32.4523 9.12446 31.6809 9.12446H31.6277V3.37883C32.2129 3.08623 32.7981 2.90002 33.7557 2.90002Z" fill="var(--uc-static-white)"/>
              <path d="M37.241 2.87268C38.8632 2.87288 39.7672 3.93658 39.7673 5.82483V6.06409H39.741L36.0437 6.56995C36.1767 7.58072 36.682 8.11292 37.613 8.11292C38.6503 8.11289 39.1555 7.7666 39.5544 7.50061V8.72424C39.1821 8.93701 38.4908 9.17634 37.4802 9.17639C35.6714 9.17639 34.6072 7.95314 34.6072 6.01135C34.6072 4.12274 35.6184 2.87268 37.241 2.87268ZM37.1873 3.85706C36.3627 3.88366 35.9636 4.4686 35.9636 5.5592L38.4636 5.2135C38.4104 3.9899 37.6656 3.85706 37.24 3.85706H37.1873Z" fill="var(--uc-static-white)"/>
              <path d="M45.0608 9.04382C44.715 9.12361 43.5446 9.20396 43.0657 9.20398H42.9592C41.1504 9.17738 40.1663 8.13923 40.1663 6.27722C40.1664 4.38903 41.2034 3.16611 42.7991 3.16589C43.1183 3.16589 43.3851 3.19179 43.5979 3.245V2.18152C43.5979 1.41019 44.2092 0.771481 45.0071 0.771362H45.0608V9.04382ZM43.1184 4.04285C41.895 4.04285 41.6546 5.21304 41.6545 6.19714C41.6545 7.55375 42.1073 8.24597 43.0383 8.24597C43.1979 8.24596 43.543 8.21883 43.6497 8.19226V4.09656H43.6233C43.4638 4.0434 43.3044 4.04285 43.1184 4.04285Z" fill="var(--uc-static-white)"/>
              <path d="M47.2153 7.71442C47.2153 8.48582 46.6032 9.12457 45.8052 9.12457H45.7524V2.89996H47.2153V7.71442ZM46.4966 0.74469C46.9488 0.74469 47.2944 1.0908 47.2944 1.48981C47.2943 1.88872 46.9487 2.20758 46.4966 2.20758C46.0445 2.20753 45.6988 1.88868 45.6987 1.48981C45.6721 1.06424 46.0444 0.744743 46.4966 0.74469Z" fill="var(--uc-static-white)"/>
              <path d="M49.8226 0.74469V2.8993H50.7802V4.09631H49.8226V7.39473C49.8226 7.79373 49.9556 7.92673 50.3812 7.92673C50.4876 7.92673 50.6472 7.90013 50.7802 7.84693V9.07054C50.727 9.09714 50.4344 9.20354 50.0354 9.20354C48.9448 9.20354 48.3596 8.67154 48.3596 7.71393V4.09631H47.7212V2.8993H48.3596V2.1545C48.3596 1.38309 48.9714 0.74469 49.7428 0.74469H49.8226V0.74469Z" fill="var(--uc-static-white)"/>
              <path d="M56.0745 0.558716C58.1491 0.558765 59.1867 1.4631 59.1868 2.68665C59.2134 3.88365 58.3349 4.41572 57.5901 4.57532V4.60168C58.3881 4.76129 59.4788 5.45327 59.4788 6.67688C59.4787 8.35252 58.1491 9.07038 56.1809 9.07043C54.3328 9.07043 53.6375 9.04446 53.6272 9.04407V1.03723C54.1592 0.771277 55.0372 0.558716 56.0745 0.558716ZM55.6213 5.02747H55.1418V8.13977H56.1526C57.1634 8.13977 57.9084 7.74089 57.9084 6.67688C57.9084 5.50667 57.2437 4.97434 55.6213 5.02747ZM56.0999 1.46301C55.7275 1.46301 55.4344 1.51603 55.1418 1.59583V4.22961H55.6213C57.1639 4.30935 57.6692 3.83021 57.6692 2.81946C57.669 1.88875 57.1371 1.46301 56.0999 1.46301Z" fill="var(--uc-static-white)"/>
              <path d="M62.1909 2.87268C63.441 2.87269 64.5052 3.51082 64.5054 5.05334V9.01721C64.1064 9.09701 63.1482 9.17639 62.563 9.17639H62.2437C60.5949 9.17627 59.7438 8.48517 59.7437 7.31506C59.7437 5.71905 61.2869 5.34673 63.1489 5.18713V4.78772C63.1489 3.98978 62.6698 3.77701 61.9517 3.77698C61.3665 3.77698 60.7807 3.98977 60.1157 4.33557V3.3512C60.5147 3.165 61.2333 2.87268 62.1909 2.87268ZM63.1489 5.85217C61.8456 5.98516 61.0475 6.25149 61.0474 7.2887C61.0474 8.06003 61.5259 8.40582 62.3237 8.40588C62.6429 8.40588 63.0159 8.37975 63.1489 8.35315V5.85217Z" fill="var(--uc-static-white)"/>
              <path d="M67.5107 2.87341C69.5855 2.87341 69.9313 4.04382 69.9313 4.73542V9.09785H69.8781C69.1067 9.09785 68.4417 8.45945 68.4417 7.68804V4.76202C68.4417 4.36302 68.2821 3.85762 67.4575 3.85762C67.0851 3.85762 66.8457 3.91082 66.6063 3.99062C66.6063 4.09702 66.6063 9.09785 66.6063 9.09785H65.1167V3.32562C65.7551 3.05961 66.7925 2.87341 67.5107 2.87341Z" fill="var(--uc-static-white)"/>
              <path d="M72.0607 7.66145C72.0607 8.45946 71.4489 9.09786 70.5977 9.09786V2.15522C70.5977 1.35721 71.2095 0.718811 72.0607 0.718811V5.77284L73.8961 3.03302H75.2793L73.3907 5.79944L75.6251 9.09786H74.0557L72.0607 6.01224V7.66145Z" fill="var(--uc-static-white)"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
