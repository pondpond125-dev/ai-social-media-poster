import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Loader2, Plus, Edit, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { FacebookPageForm } from "./FacebookPageForm";

export function FacebookPagesList() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<any>(null);

  const { data: pages, isLoading, refetch } = trpc.facebookPages.list.useQuery();
  const deleteMutation = trpc.facebookPages.delete.useMutation({
    onSuccess: () => {
      toast.success("ลบ Facebook Page เรียบร้อยแล้ว");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "เกิดข้อผิดพลาดในการลบ");
    },
  });

  const handleDelete = async (id: string, pageName: string) => {
    if (confirm(`ต้องการลบ "${pageName}" ใช่หรือไม่?`)) {
      deleteMutation.mutate({ id });
    }
  };

  const handleEdit = (page: any) => {
    setEditingPage(page);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingPage(null);
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Facebook Pages</h3>
        <Button
          onClick={() => setIsFormOpen(true)}
          size="sm"
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          เพิ่ม Facebook Page
        </Button>
      </div>

      {!pages || pages.length === 0 ? (
        <Card className="bg-white/5 border-white/10 p-8 text-center">
          <p className="text-white/70">ยังไม่มี Facebook Page</p>
          <p className="text-sm text-white/50 mt-2">
            คลิก "เพิ่ม Facebook Page" เพื่อเริ่มต้น
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {pages.map((page) => (
            <Card
              key={page.id}
              className="bg-white/5 border-white/10 p-4 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-white">{page.pageName}</h4>
                    {page.isActive ? (
                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-400" />
                    )}
                  </div>
                  <p className="text-sm text-white/70 mt-1">
                    Page ID: {page.pageId}
                  </p>
                  <p className="text-xs text-white/50 mt-1">
                    เพิ่มเมื่อ: {new Date(page.createdAt!).toLocaleDateString("th-TH")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(page)}
                    className="text-white hover:bg-white/10"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(page.id, page.pageName)}
                    disabled={deleteMutation.isPending}
                    className="text-red-400 hover:bg-red-500/10"
                  >
                    {deleteMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {isFormOpen && (
        <FacebookPageForm
          page={editingPage}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
}

