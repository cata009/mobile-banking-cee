import { getInvestmentOverview } from '@/features/investments/mobileFirstValuation'
import { IconsInvestimentiGrafico } from './MobileFirstInvestmentChart'
import imgEllipse1201 from '@/assets/mobile-first/it/investments/overview/edge-imgEllipse1201.svg'
import imgEllipse1202 from '@/assets/mobile-first/it/investments/overview/edge-imgEllipse1202.svg'
import imgEllipse1203 from '@/assets/mobile-first/it/investments/overview/edge-imgEllipse1203.svg'
import imgEllipse1204 from '@/assets/mobile-first/it/investments/overview/edge-imgEllipse1204.svg'
import imgNavigationAndActionInfoSmallK10 from '@/assets/mobile-first/it/investments/overview/edge-imgNavigationAndActionInfoSmallK10.svg'
import imgGroup632747 from '@/assets/mobile-first/it/investments/overview/edge-imgGroup632747.svg'
import imgNavigationAndActionInfoSmall from '@/assets/mobile-first/it/investments/overview/edge-imgNavigationAndActionInfoSmall.svg'
import imgIconsInvestimentiGrafico from '@/assets/mobile-first/it/investments/overview/edge-imgIconsInvestimentiGrafico.svg'
import imgIconsInvestimentiGrafico1 from '@/assets/mobile-first/it/investments/overview/edge-imgIconsInvestimentiGrafico1.svg'

export default function MobileFirstInvestmentChartEdge({
  hidden,
  onInfo,
  totalCents = getInvestmentOverview('edge').totalCents,
  esgCents = getInvestmentOverview('edge').esgCents,
  allocations = getInvestmentOverview('edge').allocations,
  esgAllocations = getInvestmentOverview('edge').esgAllocations,
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
    <div
      className={
        'content-stretch flex gap-[10px] h-[322px] items-center justify-center pl-[40px] pr-[49px] relative w-[393px]'
      }
      data-node-id="21106:137595"
    >
      <div className="overflow-clip relative shrink-0 size-[322px]" data-node-id="21106:137596" data-name="Grafico">
        {ring()}
        <div
          className="absolute flex items-center justify-center left-[0.45px] size-[321.096px] top-[0.45px]"
          data-node-id="21106:137597"
        >
          <div className="-rotate-59 -scale-y-100 flex-none">
            <div className="relative size-[234px]">
              <div className="absolute inset-[-0.85%_-0.85%_25.03%_8.43%]">
                <img alt="" className="block max-w-none " style={{ opacity: 0 }} src={imgEllipse1201} />
              </div>
            </div>
          </div>
        </div>
        <div
          className="absolute flex items-center justify-center left-[44px] size-[234px] top-[44px]"
          data-node-id="21106:137598"
        >
          <div className="-scale-y-100 flex-none">
            <div className="relative size-[234px]">
              <div className="absolute inset-[-0.65%_48.84%_4.42%_-0.85%]">
                <img alt="" className="block max-w-none " style={{ opacity: 0 }} src={imgEllipse1202} />
              </div>
            </div>
          </div>
        </div>
        <div
          className="absolute flex items-center justify-center left-[43px] size-[234px] top-[44px]"
          data-node-id="21106:137599"
        >
          <div className="-scale-y-100 flex-none">
            <div className="relative size-[234px]">
              <div className="absolute inset-[85.03%_56.65%_0.92%_32.28%]">
                <img alt="" className="block max-w-none " style={{ opacity: 0 }} src={imgEllipse1203} />
              </div>
            </div>
          </div>
        </div>
        <div className="absolute left-[42px] size-[234px] top-[44px]" data-node-id="21106:137600">
          <div className="absolute inset-[-0.71%_48.54%_86.51%_41.18%]">
            <img alt="" className="block max-w-none " style={{ opacity: 0 }} src={imgEllipse1204} />
          </div>
        </div>
        <div
          className="-translate-x-1/2 -translate-y-1/2 absolute content-stretch flex flex-col gap-[4px] items-center left-[calc(50%-1px)] top-[calc(50%+1.7px)]"
          data-node-id="21106:137602"
        >
          <div
            className="content-stretch flex gap-[4px] items-center justify-center relative shrink-0"
            data-node-id="21106:137603"
          >
            <div
              className="[word-break:break-word] flex flex-col font-[family-name:var(--font-family,'UniCredit:Regular')] justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-[color:var(--text\/k10,#262626)] whitespace-nowrap"
              data-node-id="21106:137604"
            >
              <p className="leading-[22px]">Investimenti</p>
            </div>
            <div
              className="relative shrink-0 size-[12px]"
              data-node-id="21106:137605"
              data-name="Navigation and action/Info Small_K10"
            >
              <button
                type="button"
                className="mfi-chart-info"
                aria-label="Informazioni investimenti Edge"
                onClick={onInfo}
              >
                <img alt="" className="absolute block inset-0 max-w-none " src={imgNavigationAndActionInfoSmallK10} />
              </button>
            </div>
          </div>
          <div
            className="content-stretch flex flex-col items-end justify-center relative shrink-0"
            data-node-id="21106:137606"
            data-name="Mobile/Cifra"
          >
            <div
              className="[word-break:break-word] content-stretch flex items-baseline justify-center leading-[0] not-italic relative shrink-0 text-[color:var(--neutral\/k10,#262626)] text-right w-full whitespace-nowrap"
              data-node-id="I21106:137606;1222:5223"
              data-name="Valore"
            >
              <div
                className="flex flex-col font-[family-name:var(--font-family,'UniCredit:Bold')] justify-end relative shrink-0 text-[18px]"
                data-node-id="I21106:137606;1222:5224"
              >
                <p className="leading-[24px]">
                  {hidden ? '••••' : Math.floor(totalCents / 100).toLocaleString('it-IT')}
                </p>
              </div>
              <div
                className="flex flex-col font-[family-name:var(--font-family,'UniCredit:Regular')] justify-end relative shrink-0 text-[14px]"
                data-node-id="I21106:137606;1222:5225"
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
        <IconsInvestimentiGrafico className="absolute left-[9px] size-[32px] top-[149px]" esg={false} size="Medium" />
        <IconsInvestimentiGrafico
          className="absolute left-[101px] size-[32px] top-[14px]"
          esg={false}
          size="Medium"
          tipologia="Prodotti di risparmio"
        />
        <IconsInvestimentiGrafico
          className="absolute left-[135px] size-[32px] top-[8px]"
          esg={false}
          size="Medium"
          tipologia="Banca assicurazione"
        />
      </div>
      <div
        className="absolute left-[326px] opacity-40 overflow-clip size-[322px] top-0"
        data-node-id="21106:137611"
        data-name="Grafico"
      >
        <div className="absolute h-[236px] left-[41px] top-[43px] w-[235px]" data-node-id="21106:137612">
          <div className="absolute h-[234px] left-0 top-px w-[235px]" data-node-id="21106:137613">
            <div className="absolute inset-[-0.62%_-0.43%_-0.85%_-0.43%]">
              <img alt="" className="block max-w-none " src={imgGroup632747} />
            </div>
          </div>
          <div
            className="-translate-x-1/2 -translate-y-1/2 absolute content-stretch flex flex-col gap-[4.8px] items-center left-[calc(50%-0.5px)] top-[calc(50%+0.1px)]"
            data-node-id="21106:137616"
          >
            <div
              className="content-stretch flex flex-col gap-[4px] h-[41px] items-center relative shrink-0 w-[104px]"
              data-node-id="21106:137617"
            >
              <div
                className="content-stretch flex flex-col items-center justify-center relative shrink-0 w-full"
                data-node-id="21106:137618"
              >
                <div
                  className="[word-break:break-word] flex flex-col font-[family-name:var(--font-family,'UniCredit:Regular')] justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-[color:var(--neutral\/k10,#262626)] whitespace-nowrap"
                  data-node-id="21106:137619"
                >
                  <p className="leading-[20px]">Investimenti ESG</p>
                </div>
              </div>
              <div
                className="[word-break:break-word] content-stretch flex items-center justify-center leading-[0] not-italic relative shrink-0 text-[color:var(--neutral\/k10,#262626)] text-right w-full whitespace-nowrap"
                data-node-id="21106:137620"
              >
                <div
                  className="flex flex-col font-[family-name:var(--font-family,'UniCredit:Bold')] justify-end relative shrink-0 text-[18px]"
                  data-node-id="21106:137621"
                >
                  <p className="leading-[24px]">
                    {hidden ? '••••' : Math.floor(esgCents / 100).toLocaleString('it-IT')}
                  </p>
                </div>
                <div
                  className="flex flex-col font-[family-name:var(--font-family,'UniCredit:Regular')] justify-end relative shrink-0 text-[14px]"
                  data-node-id="21106:137622"
                >
                  <p className="leading-[20px]">{hidden ? '' : `,${String(esgCents % 100).padStart(2, '0')} €`}</p>
                </div>
              </div>
            </div>
            <div
              className="relative shrink-0 size-[14.4px]"
              data-node-id="21106:137623"
              data-name="Navigation and action/Info/Small"
            >
              <button
                type="button"
                className="mfi-chart-info"
                aria-label="Informazioni investimenti Edge"
                onClick={onInfo}
              >
                <img alt="" className="absolute block inset-0 max-w-none " src={imgNavigationAndActionInfoSmall} />
              </button>
            </div>
          </div>
        </div>
        <div
          className="-translate-x-1/2 -translate-y-1/2 absolute left-[calc(50%+133px)] size-[24px] top-[calc(50%+32px)]"
          data-node-id="21106:137624"
          data-name="Icons / Investimenti / Grafico"
        >
          <img alt="" className="absolute block inset-0 max-w-none " src={imgIconsInvestimentiGrafico} />
        </div>
        <div
          className="absolute left-[10px] size-[32px] top-[94px]"
          data-node-id="21106:137625"
          data-name="Icons / Investimenti / Grafico"
        >
          <img alt="" className="absolute block inset-0 max-w-none " src={imgIconsInvestimentiGrafico1} />
        </div>
      </div>
    </div>
  )
}
