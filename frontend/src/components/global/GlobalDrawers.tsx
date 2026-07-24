import React, { useEffect } from 'react';
import { useUIStore, unlockDocumentUi } from '../../store/uiStore';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '../ui/Sheet';
import { CustomerProfile } from '../drawers/CustomerProfile';
import { EntityDrawer } from '../drawers/EntityDrawer';
import { AIAssistantDrawer } from '../drawers/AIAssistantDrawer';
import { GenericDrawerContent } from '../drawers/GenericDrawerContent';

export function GlobalDrawers() {
  const isOpen = useUIStore((s) => s.drawer.isOpen);
  const type = useUIStore((s) => s.drawer.type);
  const data = useUIStore((s) => s.drawer.data);

  useEffect(() => {
    if (!isOpen) unlockDocumentUi();
  }, [isOpen]);

  const getDrawerTitle = () => {
    switch (type) {
      case 'ENTITY_DETAILS':
        return data?.title || 'تفاصيل الكيان';
      case 'ORDER_DETAILS':
        return 'تفاصيل الطلب';
      case 'CUSTOMER_DETAILS':
        return 'ملف العميل';
      case 'MACHINE_DETAILS':
        return 'سجل الآلة';
      case 'DESIGN_DETAILS':
        return 'معاينة التصميم';
      case 'INVOICE_PREVIEW':
        return 'عرض الفاتورة';
      case 'AI_ASSISTANT':
        return 'المساعد الذكي';
      default:
        return 'تفاصيل';
    }
  };

  const renderDrawerContent = () => {
    switch (type) {
      case 'ENTITY_DETAILS':
        return <EntityDrawer data={data} />;
      case 'ORDER_DETAILS':
      case 'CUSTOMER_DETAILS':
        return <CustomerProfile data={data} />;
      case 'AI_ASSISTANT':
        return <AIAssistantDrawer />;
      case 'MACHINE_DETAILS':
      case 'INVOICE_PREVIEW':
      case 'DESIGN_DETAILS':
        return <GenericDrawerContent title={getDrawerTitle()} />;
      default:
        return null;
    }
  };

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          useUIStore.getState().drawer.closeDrawer();
          unlockDocumentUi();
        }
      }}
    >
      <SheetContent side="left" className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{getDrawerTitle()}</SheetTitle>
          <SheetDescription />
        </SheetHeader>
        <div className="py-6">{renderDrawerContent()}</div>
      </SheetContent>
    </Sheet>
  );
}
