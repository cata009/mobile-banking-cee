import { BottomSheet } from "@/app/components/BottomSheet";
import NavigationRow from "@/app/components/NavigationRow";
import {
  getProductCardSheetConfig,
  type ProductCardSheetOption,
  type ProductsCard,
} from "@/app/config/productsMenuConfig";
import type { CountryId } from "@/app/state/demoTypes";

export interface ProductDetailSelection {
  cardId: ProductsCard["id"];
  categoryTitle: string;
  optionId: string;
  title: string;
}

interface ProductCardBottomSheetProps {
  card: ProductsCard;
  country?: CountryId;
  onClose: () => void;
  onProductOptionClick?: (selection: ProductDetailSelection) => void;
}

export default function ProductCardBottomSheet({
  card,
  country,
  onClose,
  onProductOptionClick,
}: ProductCardBottomSheetProps) {
  const sheetConfig = getProductCardSheetConfig(card.id, country);
  const sheetTitle = sheetConfig.title ?? card.title.replace(/\n/g, " ");

  const handleOptionClick = (option: ProductCardSheetOption) => {
    console.log(`Products sheet option clicked: ${card.id}/${option.id}`);
    onClose();
    onProductOptionClick?.({
      cardId: card.id,
      categoryTitle: sheetTitle,
      optionId: option.id,
      title: option.title,
    });
  };

  return (
    <BottomSheet
      title={sheetTitle}
      className="px-0 pb-[24px] pt-[24px]"
      headerClassName="px-[24px]"
      bodyClassName="w-full"
      onClose={onClose}
    >
      <div className="flex w-full flex-col" data-products-card-sheet="true">
        {sheetConfig.options.map((option) => (
          <NavigationRow
            key={option.id}
            title={option.title}
            trailingAccessory="chevron"
            className="pr-[16px]"
            titleClassName="text-[18px] leading-normal tracking-[0.3px]"
            titleStyle={{ fontSize: "18px", lineHeight: "normal", letterSpacing: "0.3px" }}
            onClick={() => handleOptionClick(option)}
          />
        ))}
      </div>
    </BottomSheet>
  );
}
