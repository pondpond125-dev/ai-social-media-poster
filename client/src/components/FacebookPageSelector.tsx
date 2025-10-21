import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Loader2, AlertCircle } from "lucide-react";

interface FacebookPageSelectorProps {
  selectedPageIds: string[];
  onChange: (pageIds: string[]) => void;
}

export function FacebookPageSelector({ selectedPageIds, onChange }: FacebookPageSelectorProps) {
  const { data: pages, isLoading } = trpc.facebookPages.list.useQuery();

  const handleToggle = (pageId: string, checked: boolean) => {
    if (checked) {
      onChange([...selectedPageIds, pageId]);
    } else {
      onChange(selectedPageIds.filter((id) => id !== pageId));
    }
  };

  if (isLoading) {
    return (
      <div className="ml-6 mt-2 flex items-center gap-2 text-white/60">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">กำลังโหลด Pages...</span>
      </div>
    );
  }

  if (!pages || pages.length === 0) {
    return (
      <div className="ml-6 mt-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="text-yellow-400 font-medium">ยังไม่มี Facebook Page</p>
            <p className="text-yellow-300/80 mt-1">
              ไปที่หน้า Settings เพื่อเพิ่ม Facebook Page ก่อนค่ะ
            </p>
          </div>
        </div>
      </div>
    );
  }

  const activePages = pages.filter((page) => page.isActive);

  if (activePages.length === 0) {
    return (
      <div className="ml-6 mt-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="text-yellow-400 font-medium">ไม่มี Page ที่เปิดใช้งาน</p>
            <p className="text-yellow-300/80 mt-1">
              ไปที่หน้า Settings เพื่อเปิดใช้งาน Facebook Page
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ml-6 mt-2 space-y-2 p-3 bg-white/5 rounded-lg border border-white/10">
      <p className="text-xs text-white/60 mb-2">
        เลือก Pages ที่ต้องการโพสต์ ({selectedPageIds.length}/{activePages.length})
      </p>
      {activePages.map((page) => (
        <div key={page.id} className="flex items-center gap-2">
          <Checkbox
            id={`page-${page.id}`}
            checked={selectedPageIds.includes(page.id)}
            onCheckedChange={(checked) => handleToggle(page.id, checked as boolean)}
          />
          <Label
            htmlFor={`page-${page.id}`}
            className="text-sm text-white/90 cursor-pointer flex-1"
          >
            {page.pageName}
          </Label>
        </div>
      ))}
    </div>
  );
}

