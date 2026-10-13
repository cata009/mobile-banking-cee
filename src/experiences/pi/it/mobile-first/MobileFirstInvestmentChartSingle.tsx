import { getInvestmentOverview } from '@/features/investments/mobileFirstValuation'
import { IconsInvestimentiGrafico } from './MobileFirstInvestmentChart'
import imgEllipse1201 from '@/assets/mobile-first/it/investments/overview/single-imgEllipse1201.svg'
import imgNavigationAndActionInfoSmallK10 from '@/assets/mobile-first/it/investments/overview/single-imgNavigationAndActionInfoSmallK10.svg'
import imgGroup632747 from '@/assets/mobile-first/it/investments/overview/single-imgGroup632747.svg'
import imgNavigationAndActionInfoSmall from '@/assets/mobile-first/it/investments/overview/single-imgNavigationAndActionInfoSmall.svg'
import imgIconsInvestimentiGrafico from '@/assets/mobile-first/it/investments/overview/single-imgIconsInvestimentiGrafico.svg'
import imgIconsInvestimentiGrafico1 from '@/assets/mobile-first/it/investments/overview/single-imgIconsInvestimentiGrafico1.svg'

export default function MobileFirstInvestmentChartSingle({
  hidden,
  onInfo,
  totalCents = getInvestmentOverview('single').totalCents,
  esgCents = getInvestmentOverview('single').esgCents,
  allocations = getInvestmentOverview('single').allocations,
  esgAllocations = getInvestmentOverview('single').esgAllocations,
}: {
  hidden: boolean
  onInfo: () => void
  totalCents?: number
  esgCents?: number
  allocations?: readonly { percent: number }[]
  esgAllocations?: readonly { percent: number }[]
}) {
  const colors = ['#007a91', '#46a5b6', '#86cbd4', '#badde2', '#d7e8ea', '#e7eff0']
  const ring = (esg = false) => (
    <svg
      aria-label={esg ? 'Allocazione ESG' : 'Allocazione investimenti'}
      style={{ position: 'absolute', left: 44, top: 44, width: 234, height: 234 }}
      viewBox="0 0 234 234"
    >
      {(esg ? esgAllocations : allocations).map((item, index) => {
        const start = (esg ? esgAllocations : allocations).slice(0, index).reduce((sum, a) => sum + a.percent, 0)
        return (
          <circle
            key={index}
            cx="117"
            cy="117"
            r="106"
            fill="none"
            stroke={colors[index % colors.length]}
            strokeWidth="20"
            pathLength="100"
            strokeDasharray={`${item.percent} ${100 - item.percent}`}
            strokeDashoffset={-start}
            transform="rotate(-90 117 117)"
          />
        )
      })}
    </svg>
  )
  return (
    <div className={'h-[322px] relative w-[393px]'} data-node-id="21106:137539">
      <div
        className="absolute left-[36px] overflow-clip size-[322px] top-0"
        data-node-id="21106:137540"
        data-name="Grafico Strumenti"
      >
        {ring()}
        <div
          className="absolute flex items-center justify-center left-[1.95px] size-[318.106px] top-[1.95px]"
          data-node-id="21106:137541"
        >
          <div className="-rotate-119 flex-none">
            <div className="relative size-[234px]">
              <div className="absolute inset-[-0.85%]">
                <img alt="" className="block max-w-none " style={{ opacity: 0 }} src={imgEllipse1201} />
              </div>
            </div>
          </div>
        </div>
        <div
          className="-translate-x-1/2 -translate-y-1/2 absolute content-stretch flex flex-col gap-[4px] items-center left-[calc(50%-1px)] top-[calc(50%+1.7px)]"
          data-node-id="21106:137542"
        >
          <div
            className="content-stretch flex gap-[4px] items-center justify-center relative shrink-0"
            data-node-id="21106:137543"
          >
            <div
              className="[word-break:break-word] flex flex-col font-[family-name:var(--font-family,'UniCredit:Regular')] justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-[color:var(--text\/k10,#262626)] whitespace-nowrap"
              data-node-id="21106:137544"
            >
              <p className="leading-[22px]">Investimenti</p>
            </div>
            <div
              className="relative shrink-0 size-[12px]"
              data-node-id="21106:137545"
              data-name="Navigation and action/Info Small_K10"
            >
              <button
                type="button"
                className="mfi-chart-info"
                aria-label="Informazioni investimenti Single"
                onClick={onInfo}
              >
                <img alt="" className="absolute block inset-0 max-w-none " src={imgNavigationAndActionInfoSmallK10} />
              </button>
            </div>
          </div>
          <div
            className="content-stretch flex flex-col items-end justify-center relative shrink-0"
            data-node-id="21106:137546"
            data-name="Mobile/Cifra"
          >
            <div
              className="[word-break:break-word] content-stretch flex items-baseline justify-center leading-[0] not-italic relative shrink-0 text-[color:var(--neutral\/k10,#262626)] text-right w-full whitespace-nowrap"
              data-node-id="I21106:137546;1222:5223"
              data-name="Valore"
            >
              <div
                className="flex flex-col font-[family-name:var(--font-family,'UniCredit:Bold')] justify-end relative shrink-0 text-[18px]"
                data-node-id="I21106:137546;1222:5224"
              >
                <p className="leading-[24px]">
                  {hidden ? '••••' : Math.floor(totalCents / 100).toLocaleString('it-IT')}
                </p>
              </div>
              <div
                className="flex flex-col font-[family-name:var(--font-family,'UniCredit:Regular')] justify-end relative shrink-0 text-[14px]"
                data-node-id="I21106:137546;1222:5225"
              >
                <p className="leading-[20px]">{hidden ? '' : `,${String(totalCents % 100).padStart(2, '0')} €`}</p>
              </div>
            </div>
          </div>
        </div>
        <IconsInvestimentiGrafico
          className="-translate-x-1/2 -translate-y-1/2 absolute left-[calc(50%+136px)] size-[32px] top-[calc(50%+4px)]"
          esg={false}
          size="Medium"
          tipologia="Titoli"
        />
      </div>
      <div
        className="absolute left-[326px] opacity-40 overflow-clip size-[322px] top-0"
        data-node-id="21106:137548"
        data-name="Grafico ESG"
      >
        <div className="absolute h-[236px] left-[41px] top-[43px] w-[235px]" data-node-id="21106:137549">
          <div className="absolute h-[234px] left-0 top-px w-[235px]" data-node-id="21106:137550">
            <div className="absolute inset-[-0.62%_-0.43%_-0.85%_-0.43%]">
              <img alt="" className="block max-w-none " src={imgGroup632747} />
            </div>
          </div>
          <div
            className="-translate-x-1/2 -translate-y-1/2 absolute content-stretch flex flex-col gap-[4.8px] items-center left-[calc(50%-0.5px)] top-[calc(50%+0.1px)]"
            data-node-id="21106:137553"
          >
            <div
              className="content-stretch flex flex-col gap-[4px] h-[41px] items-center relative shrink-0 w-[104px]"
              data-node-id="21106:137554"
            >
              <div
                className="content-stretch flex flex-col items-center justify-center relative shrink-0 w-full"
                data-node-id="21106:137555"
              >
                <div
                  className="[word-break:break-word] flex flex-col font-[family-name:var(--font-family,'UniCredit:Regular')] justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-[color:var(--neutral\/k10,#262626)] whitespace-nowrap"
                  data-node-id="21106:137556"
                >
                  <p className="leading-[20px]">Investimenti ESG</p>
                </div>
              </div>
              <div
                className="[word-break:break-word] content-stretch flex items-center justify-center leading-[0] not-italic relative shrink-0 text-[color:var(--neutral\/k10,#262626)] text-right w-full whitespace-nowrap"
                data-node-id="21106:137557"
              >
                <div
                  className="flex flex-col font-[family-name:var(--font-family,'UniCredit:Bold')] justify-end relative shrink-0 text-[18px]"
                  data-node-id="21106:137558"
                >
                  <p className="leading-[24px]">
                    {hidden ? '••••' : Math.floor(esgCents / 100).toLocaleString('it-IT')}
                  </p>
                </div>
                <div
                  className="flex flex-col font-[family-name:var(--font-family,'UniCredit:Regular')] justify-end relative shrink-0 text-[14px]"
                  data-node-id="21106:137559"
                >
                  <p className="leading-[20px]">{hidden ? '' : `,${String(esgCents % 100).padStart(2, '0')} €`}</p>
                </div>
              </div>
            </div>
            <div
              className="relative shrink-0 size-[14.4px]"
              data-node-id="21106:137560"
              data-name="Navigation and action/Info/Small"
            >
              <button
                type="button"
                className="mfi-chart-info"
                aria-label="Informazioni investimenti Single"
                onClick={onInfo}
              >
                <img alt="" className="absolute block inset-0 max-w-none " src={imgNavigationAndActionInfoSmall} />
              </button>
            </div>
          </div>
        </div>
        <div
          className="-translate-x-1/2 -translate-y-1/2 absolute left-[calc(50%+133px)] size-[24px] top-[calc(50%+32px)]"
          data-node-id="21106:137561"
          data-name="Icons / Investimenti / Grafico"
        >
          <img alt="" className="absolute block inset-0 max-w-none " src={imgIconsInvestimentiGrafico} />
        </div>
        <div
          className="absolute left-[10px] size-[32px] top-[94px]"
          data-node-id="21106:137562"
          data-name="Icons / Investimenti / Grafico"
        >
          <img alt="" className="absolute block inset-0 max-w-none " src={imgIconsInvestimentiGrafico1} />
        </div>
      </div>
    </div>
  )
}
