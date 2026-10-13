import { getInvestmentOverview } from '@/features/investments/mobileFirstValuation'
import imgTipologiaTitoliSizeMediumEsgFalse from '@/assets/mobile-first/it/investments/imgTipologiaTitoliSizeMediumEsgFalse.svg'
import imgTipologiaFondiSizeMediumEsgFalse from '@/assets/mobile-first/it/investments/imgTipologiaFondiSizeMediumEsgFalse.svg'
import imgTipologiaProdottiDiRisparmioSizeMediumEsgFalse from '@/assets/mobile-first/it/investments/imgTipologiaProdottiDiRisparmioSizeMediumEsgFalse.svg'
import imgTipologiaBancaAssicurazioneSizeMediumEsgFalse from '@/assets/mobile-first/it/investments/imgTipologiaBancaAssicurazioneSizeMediumEsgFalse.svg'
import imgTipologiaGestioneDiPortafogliSizeMediumEsgFalse from '@/assets/mobile-first/it/investments/imgTipologiaGestioneDiPortafogliSizeMediumEsgFalse.svg'
import imgTipologiaFondiPensioneSizeMediumEsgFalse from '@/assets/mobile-first/it/investments/imgTipologiaFondiPensioneSizeMediumEsgFalse.svg'
import imgTipologiaProdottiDiRisparmioSizeMediumEsgTrue from '@/assets/mobile-first/it/investments/imgTipologiaProdottiDiRisparmioSizeMediumEsgTrue.svg'
import imgTipologiaBancaAssicurazioneSizeMediumEsgTrue from '@/assets/mobile-first/it/investments/imgTipologiaBancaAssicurazioneSizeMediumEsgTrue.svg'
import imgTipologiaGestioneDiPortafogliSizeMediumEsgTrue from '@/assets/mobile-first/it/investments/imgTipologiaGestioneDiPortafogliSizeMediumEsgTrue.svg'
import imgTipologiaFondiPensioneSizeMediumEsgTrue from '@/assets/mobile-first/it/investments/imgTipologiaFondiPensioneSizeMediumEsgTrue.svg'
import imgEllipse1201 from '@/assets/mobile-first/it/investments/imgEllipse1201.svg'
import imgEllipse1202 from '@/assets/mobile-first/it/investments/imgEllipse1202.svg'
import imgEllipse1203 from '@/assets/mobile-first/it/investments/imgEllipse1203.svg'
import imgEllipse1204 from '@/assets/mobile-first/it/investments/imgEllipse1204.svg'
import imgEllipse1205 from '@/assets/mobile-first/it/investments/imgEllipse1205.svg'
import imgEllipse1206 from '@/assets/mobile-first/it/investments/imgEllipse1206.svg'
import imgNavigationAndActionInfoSmallK10 from '@/assets/mobile-first/it/investments/imgNavigationAndActionInfoSmallK10.svg'
import imgEllipse1207 from '@/assets/mobile-first/it/investments/imgEllipse1207.svg'
import imgEllipse1208 from '@/assets/mobile-first/it/investments/imgEllipse1208.svg'
import imgEllipse1209 from '@/assets/mobile-first/it/investments/imgEllipse1209.svg'
import imgEllipse1210 from '@/assets/mobile-first/it/investments/imgEllipse1210.svg'
import imgEllipse1211 from '@/assets/mobile-first/it/investments/imgEllipse1211.svg'
import imgEllipse1212 from '@/assets/mobile-first/it/investments/imgEllipse1212.svg'
import imgIconsInvestimentiGrafico from '@/assets/mobile-first/it/investments/imgIconsInvestimentiGrafico.svg'
import imgIconsInvestimentiGrafico1 from '@/assets/mobile-first/it/investments/imgIconsInvestimentiGrafico1.svg'

type IconsInvestimentiGraficoProps = {
  className?: string
  esg?: boolean
  size?: 'Medium'
  tipologia?:
    'Banca assicurazione' | 'Fondi' | 'Titoli' | 'Fondi pensione' | 'Prodotti di risparmio' | 'Gestione di portafogli'
}

export function IconsInvestimentiGrafico({
  className,
  esg = false,
  size = 'Medium',
  tipologia = 'Titoli',
}: IconsInvestimentiGraficoProps) {
  const isBancaAssicurazioneAndMediumAndEsg = tipologia === 'Banca assicurazione' && size === 'Medium' && esg
  const isBancaAssicurazioneAndMediumAndNotEsg = tipologia === 'Banca assicurazione' && size === 'Medium' && !esg
  const isFondiAndMediumAndNotEsg = tipologia === 'Fondi' && size === 'Medium' && !esg
  const isFondiPensioneAndMediumAndEsg = tipologia === 'Fondi pensione' && size === 'Medium' && esg
  const isFondiPensioneAndMediumAndNotEsg = tipologia === 'Fondi pensione' && size === 'Medium' && !esg
  const isGestioneDiPortafogliAndMediumAndEsg = tipologia === 'Gestione di portafogli' && size === 'Medium' && esg
  const isGestioneDiPortafogliAndMediumAndNotEsg = tipologia === 'Gestione di portafogli' && size === 'Medium' && !esg
  const isProdottiDiRisparmioAndMediumAndEsg = tipologia === 'Prodotti di risparmio' && size === 'Medium' && esg
  const isProdottiDiRisparmioAndMediumAndNotEsg = tipologia === 'Prodotti di risparmio' && size === 'Medium' && !esg
  return (
    <div
      className={className || 'relative size-[32px]'}
      id={
        isFondiPensioneAndMediumAndEsg
          ? 'node-21106_136991'
          : isGestioneDiPortafogliAndMediumAndEsg
            ? 'node-21106_136988'
            : isBancaAssicurazioneAndMediumAndEsg
              ? 'node-21106_136985'
              : isProdottiDiRisparmioAndMediumAndEsg
                ? 'node-21106_136982'
                : isFondiPensioneAndMediumAndNotEsg
                  ? 'node-21106_136952'
                  : isGestioneDiPortafogliAndMediumAndNotEsg
                    ? 'node-21106_136949'
                    : isBancaAssicurazioneAndMediumAndNotEsg
                      ? 'node-21106_136934'
                      : isProdottiDiRisparmioAndMediumAndNotEsg
                        ? 'node-21106_136922'
                        : isFondiAndMediumAndNotEsg
                          ? 'node-21106_136913'
                          : 'node-21106_136904'
      }
    >
      <img
        alt=""
        className="absolute block inset-0 max-w-none"
        src={
          isFondiPensioneAndMediumAndEsg
            ? imgTipologiaFondiPensioneSizeMediumEsgTrue
            : isGestioneDiPortafogliAndMediumAndEsg
              ? imgTipologiaGestioneDiPortafogliSizeMediumEsgTrue
              : isBancaAssicurazioneAndMediumAndEsg
                ? imgTipologiaBancaAssicurazioneSizeMediumEsgTrue
                : isProdottiDiRisparmioAndMediumAndEsg
                  ? imgTipologiaProdottiDiRisparmioSizeMediumEsgTrue
                  : isFondiPensioneAndMediumAndNotEsg
                    ? imgTipologiaFondiPensioneSizeMediumEsgFalse
                    : isGestioneDiPortafogliAndMediumAndNotEsg
                      ? imgTipologiaGestioneDiPortafogliSizeMediumEsgFalse
                      : isBancaAssicurazioneAndMediumAndNotEsg
                        ? imgTipologiaBancaAssicurazioneSizeMediumEsgFalse
                        : isProdottiDiRisparmioAndMediumAndNotEsg
                          ? imgTipologiaProdottiDiRisparmioSizeMediumEsgFalse
                          : isFondiAndMediumAndNotEsg
                            ? imgTipologiaFondiSizeMediumEsgFalse
                            : imgTipologiaTitoliSizeMediumEsgFalse
        }
      />
    </div>
  )
}

export default function PortfolioChart({
  hidden,
  onInfo,
  totalCents = getInvestmentOverview('full').totalCents,
  esgCents = getInvestmentOverview('full').esgCents,
  allocations = getInvestmentOverview('full').allocations,
  esgAllocations = getInvestmentOverview('full').esgAllocations,
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
    <div className="mfi-chart">
      <div
        className="h-[322px] relative shrink-0 w-[393px]"
        data-node-id="24251:97727"
        data-name="Mobile/Grafico/Investimenti"
      >
        <div
          className="-translate-x-1/2 -translate-y-1/2 absolute left-[calc(50%+0.5px)] overflow-clip size-[322px] top-1/2"
          data-node-id="I24251:97727;2654:25195"
          data-name="Grafico Strumenti"
        >
          {ring()}
          <div
            className="absolute flex items-center justify-center left-[44px] size-[234px] top-[44px]"
            data-node-id="I24251:97727;2654:25197"
          >
            <div className="-scale-y-100 flex-none">
              <div className="relative size-[234px]">
                <div className="absolute inset-[10.71%_-0.85%_0.16%_53.77%]">
                  <img alt="" className="block max-w-none" style={{ opacity: 0 }} src={imgEllipse1201} />
                </div>
              </div>
            </div>
          </div>
          <div
            className="absolute flex items-center justify-center left-[44px] size-[234px] top-[44px]"
            data-node-id="I24251:97727;2654:25198"
          >
            <div className="-scale-y-100 flex-none">
              <div className="relative size-[234px]">
                <div className="absolute inset-[-0.85%_22.12%_66.32%_5.36%]">
                  <img alt="" className="block max-w-none" style={{ opacity: 0 }} src={imgEllipse1202} />
                </div>
              </div>
            </div>
          </div>
          <div
            className="absolute flex items-center justify-center left-[43px] size-[234px] top-[44px]"
            data-node-id="I24251:97727;2654:25199"
          >
            <div className="-scale-y-100 flex-none">
              <div className="relative size-[234px]">
                <div className="absolute inset-[30.15%_84.64%_29.53%_-0.85%]">
                  <img alt="" className="block max-w-none" style={{ opacity: 0 }} src={imgEllipse1203} />
                </div>
              </div>
            </div>
          </div>
          <div className="absolute left-[42px] size-[234px] top-[44px]" data-node-id="I24251:97727;2654:25200">
            <div className="absolute inset-[7.7%_69.67%_67.29%_5.99%]">
              <img alt="" className="block max-w-none" style={{ opacity: 0 }} src={imgEllipse1204} />
            </div>
          </div>
          <div className="absolute left-[41px] size-[234px] top-[44px]" data-node-id="I24251:97727;2654:25201">
            <div className="absolute inset-[1.09%_57.14%_83.71%_26.8%]">
              <img alt="" className="block max-w-none" style={{ opacity: 0 }} src={imgEllipse1205} />
            </div>
          </div>
          <div className="absolute left-[41px] size-[234px] top-[44px]" data-node-id="I24251:97727;9330:8542">
            <div className="absolute inset-[-0.85%_43.29%_86.6%_40.84%]">
              <img alt="" className="block max-w-none" style={{ opacity: 0 }} src={imgEllipse1206} />
            </div>
          </div>
          <div
            className="-translate-x-1/2 -translate-y-1/2 absolute content-stretch flex flex-col gap-[4px] items-center left-[calc(50%-1px)] top-[calc(50%+1.7px)]"
            data-node-id="I24251:97727;2654:25202"
          >
            <div
              className="content-stretch flex gap-[4px] items-center justify-center relative shrink-0"
              data-node-id="I24251:97727;5803:5125"
            >
              <div
                className="[word-break:break-word] flex flex-col font-[family-name:var(--font-family,'UniCredit:Regular')] justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-[color:var(--text\/k10,#262626)] whitespace-nowrap"
                data-node-id="I24251:97727;2654:25203"
              >
                <p className="leading-[22px]">Investimenti</p>
              </div>
              <div
                className="relative shrink-0 size-[12px]"
                data-node-id="I24251:97727;5803:4789"
                data-name="Navigation and action/Info Small_K10"
              >
                <button
                  type="button"
                  className="mfi-chart-info"
                  aria-label="Informazioni investimenti"
                  onClick={onInfo}
                >
                  <img alt="" className="absolute block inset-0 max-w-none" src={imgNavigationAndActionInfoSmallK10} />
                </button>
              </div>
            </div>
            <div
              className="content-stretch flex flex-col items-end justify-center relative shrink-0"
              data-node-id="I24251:97727;2654:25204"
              data-name="Mobile/Cifra"
            >
              <div
                className="[word-break:break-word] content-stretch flex items-baseline justify-center leading-[0] not-italic relative shrink-0 text-[color:var(--text\/k10,#262626)] text-right w-full whitespace-nowrap"
                data-node-id="I24251:97727;2654:25204;1222:5223"
                data-name="Valore"
              >
                <div
                  className="flex flex-col font-[family-name:var(--font-family,'UniCredit:Bold')] justify-end relative shrink-0 text-[18px]"
                  data-node-id="I24251:97727;2654:25204;1222:5224"
                >
                  <p className="leading-[24px]">
                    {hidden ? '••••' : Math.floor(totalCents / 100).toLocaleString('it-IT')}
                  </p>
                </div>
                <div
                  className="flex flex-col font-[family-name:var(--font-family,'UniCredit:Regular')] justify-end relative shrink-0 text-[14px]"
                  data-node-id="I24251:97727;2654:25204;1222:5225"
                >
                  <p className="leading-[20px]">{hidden ? '' : `,${String(totalCents % 100).padStart(2, '0')} €`}</p>
                </div>
              </div>
            </div>
          </div>
          <IconsInvestimentiGrafico className="-translate-x-1/2 -translate-y-1/2 absolute left-[calc(50%+136px)] size-[32px] top-[calc(50%-33px)]" />
          <IconsInvestimentiGrafico className="absolute left-[92px] size-[32px] top-[277px]" tipologia="Fondi" />
          <IconsInvestimentiGrafico
            className="absolute left-[8px] size-[32px] top-[147px]"
            tipologia="Prodotti di risparmio"
          />
          <IconsInvestimentiGrafico
            className="absolute left-[42px] size-[32px] top-[51px]"
            tipologia="Banca assicurazione"
          />
          <IconsInvestimentiGrafico
            className="absolute left-[96px] size-[32px] top-[16px]"
            tipologia="Gestione di portafogli"
          />
          <IconsInvestimentiGrafico
            className="absolute left-[138px] size-[32px] top-[9px]"
            tipologia="Fondi pensione"
          />
        </div>
        <div
          className="absolute left-[326px] opacity-40 overflow-clip size-[322px] top-0"
          data-node-id="I24251:97727;9360:6953"
          data-name="Grafico ESG"
        >
          {ring(true)}
          <div
            className="absolute flex items-center justify-center left-[44px] size-[234px] top-[44px]"
            data-node-id="I24251:97727;9360:6954"
          >
            <div className="-scale-y-100 flex-none">
              <div className="relative size-[234px]">
                <div className="absolute inset-[10.71%_-0.85%_0.16%_53.77%]">
                  <img alt="" className="block max-w-none" style={{ opacity: 0 }} src={imgEllipse1207} />
                </div>
              </div>
            </div>
          </div>
          <div
            className="absolute flex items-center justify-center left-[44px] size-[234px] top-[44px]"
            data-node-id="I24251:97727;9360:6955"
          >
            <div className="-scale-y-100 flex-none">
              <div className="relative size-[234px]">
                <div className="absolute inset-[-0.85%_22.12%_66.32%_5.36%]">
                  <img alt="" className="block max-w-none" style={{ opacity: 0 }} src={imgEllipse1208} />
                </div>
              </div>
            </div>
          </div>
          <div
            className="absolute flex items-center justify-center left-[43px] size-[234px] top-[44px]"
            data-node-id="I24251:97727;9360:6956"
          >
            <div className="-scale-y-100 flex-none">
              <div className="relative size-[234px]">
                <div className="absolute inset-[30.15%_84.64%_29.53%_-0.85%]">
                  <img alt="" className="block max-w-none" style={{ opacity: 0 }} src={imgEllipse1209} />
                </div>
              </div>
            </div>
          </div>
          <div className="absolute left-[42px] size-[234px] top-[44px]" data-node-id="I24251:97727;9360:6957">
            <div className="absolute inset-[7.7%_69.67%_67.29%_5.99%]">
              <img alt="" className="block max-w-none" style={{ opacity: 0 }} src={imgEllipse1210} />
            </div>
          </div>
          <div className="absolute left-[41px] size-[234px] top-[44px]" data-node-id="I24251:97727;9360:6958">
            <div className="absolute inset-[1.09%_57.14%_83.71%_26.8%]">
              <img alt="" className="block max-w-none" style={{ opacity: 0 }} src={imgEllipse1211} />
            </div>
          </div>
          <div className="absolute left-[41px] size-[234px] top-[44px]" data-node-id="I24251:97727;9360:6959">
            <div className="absolute inset-[-0.85%_43.29%_86.6%_40.84%]">
              <img alt="" className="block max-w-none" style={{ opacity: 0 }} src={imgEllipse1212} />
            </div>
          </div>
          <div
            className="-translate-x-1/2 -translate-y-1/2 absolute content-stretch flex flex-col gap-[4px] items-center left-[calc(50%-1px)] top-[calc(50%+1.7px)]"
            data-node-id="I24251:97727;9360:6960"
          >
            <div
              className="content-stretch flex gap-[4px] items-center justify-center relative shrink-0"
              data-node-id="I24251:97727;9360:6961"
            >
              <div
                className="[word-break:break-word] flex flex-col font-[family-name:var(--font-family,'UniCredit:Regular')] justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-[color:var(--text\/k10,#262626)] whitespace-nowrap"
                data-node-id="I24251:97727;9360:6962"
              >
                <p className="leading-[22px]">Investimenti</p>
              </div>
              <div
                className="relative shrink-0 size-[12px]"
                data-node-id="I24251:97727;9360:6963"
                data-name="Navigation and action/Info Small_K10"
              >
                <button
                  type="button"
                  className="mfi-chart-info"
                  aria-label="Informazioni investimenti ESG"
                  onClick={onInfo}
                >
                  <img alt="" className="absolute block inset-0 max-w-none" src={imgNavigationAndActionInfoSmallK10} />
                </button>
              </div>
            </div>
            <div
              className="content-stretch flex flex-col items-end justify-center relative shrink-0"
              data-node-id="I24251:97727;9360:6964"
              data-name="Mobile/Cifra"
            >
              <div
                className="[word-break:break-word] content-stretch flex items-baseline justify-center leading-[0] not-italic relative shrink-0 text-[color:var(--text\/k10,#262626)] text-right w-full whitespace-nowrap"
                data-node-id="I24251:97727;9360:6964;1222:5223"
                data-name="Valore"
              >
                <div
                  className="flex flex-col font-[family-name:var(--font-family,'UniCredit:Bold')] justify-end relative shrink-0 text-[18px]"
                  data-node-id="I24251:97727;9360:6964;1222:5224"
                >
                  <p className="leading-[24px]">
                    {hidden ? '••••' : Math.floor(esgCents / 100).toLocaleString('it-IT')}
                  </p>
                </div>
                <div
                  className="flex flex-col font-[family-name:var(--font-family,'UniCredit:Regular')] justify-end relative shrink-0 text-[14px]"
                  data-node-id="I24251:97727;9360:6964;1222:5225"
                >
                  <p className="leading-[20px]">{hidden ? '' : `,${String(esgCents % 100).padStart(2, '0')} €`}</p>
                </div>
              </div>
            </div>
          </div>
          <div
            className="-translate-x-1/2 -translate-y-1/2 absolute left-[calc(50%+136px)] size-[32px] top-1/2"
            data-node-id="I24251:97727;9360:6965"
            data-name="Icons / Investimenti / Grafico"
          >
            <img alt="" className="absolute block inset-0 max-w-none" src={imgIconsInvestimentiGrafico} />
          </div>
          <div
            className="absolute left-[92px] size-[32px] top-[277px]"
            data-node-id="I24251:97727;9360:6966"
            data-name="Icons / Investimenti / Grafico"
          >
            <img alt="" className="absolute block inset-0 max-w-none" src={imgIconsInvestimentiGrafico1} />
          </div>
          <IconsInvestimentiGrafico
            className="absolute left-[8px] size-[32px] top-[147px]"
            esg
            tipologia="Prodotti di risparmio"
          />
          <IconsInvestimentiGrafico
            className="absolute left-[42px] size-[32px] top-[51px]"
            esg
            tipologia="Banca assicurazione"
          />
          <IconsInvestimentiGrafico
            className="absolute left-[96px] size-[32px] top-[16px]"
            esg
            tipologia="Gestione di portafogli"
          />
          <IconsInvestimentiGrafico
            className="absolute left-[138px] size-[32px] top-[9px]"
            esg
            tipologia="Fondi pensione"
          />
        </div>
      </div>
    </div>
  )
}
