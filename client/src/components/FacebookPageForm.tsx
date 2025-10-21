import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Loader2, X, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface FacebookPageFormProps {
  page?: any;
  onClose: () => void;
}

export function FacebookPageForm({ page, onClose }: FacebookPageFormProps) {
  const [pageName, setPageName] = useState(page?.pageName || "");
  const [pageId, setPageId] = useState(page?.pageId || "");
  const [pageAccessToken, setPageAccessToken] = useState(page?.pageAccessToken || "");
  const [isCheckingToken, setIsCheckingToken] = useState(false);
  const [tokenInfo, setTokenInfo] = useState<any>(null);

  const createMutation = trpc.facebookPages.create.useMutation({
    onSuccess: () => {
      toast.success("เพิ่ม Facebook Page เรียบร้อยแล้ว");
      onClose();
    },
    onError: (error) => {
      toast.error(error.message || "เกิดข้อผิดพลาดในการเพิ่ม");
    },
  });

  const updateMutation = trpc.facebookPages.update.useMutation({
    onSuccess: () => {
      toast.success("อัปเดต Facebook Page เรียบร้อยแล้ว");
      onClose();
    },
    onError: (error) => {
      toast.error(error.message || "เกิดข้อผิดพลาดในการอัปเดต");
    },
  });

  const handleCheckToken = async () => {
    if (!pageAccessToken) {
      toast.error("กรุณากรอก Access Token ก่อน");
      return;
    }

    setIsCheckingToken(true);
    setTokenInfo(null);

    try {
      // Check token info
      const debugResponse = await fetch(
        `https://graph.facebook.com/debug_token?input_token=${pageAccessToken}&access_token=${pageAccessToken}`
      );
      const debugData = await debugResponse.json();

      // Get token owner info
      const meResponse = await fetch(
        `https://graph.facebook.com/v18.0/me?access_token=${pageAccessToken}`
      );
      const meData = await meResponse.json();

      setTokenInfo({
        debug: debugData.data,
        me: meData,
      });

      // Auto-fill page name and ID if not set
      if (!pageName && meData.name) {
        setPageName(meData.name);
      }
      if (!pageId && meData.id) {
        setPageId(meData.id);
      }

      if (debugData.data?.type === "PAGE") {
        toast.success("ตรวจสอบสำเร็จ! เป็น Page Access Token");
      } else {
        toast.error("ผิด! ต้องใช้ Page Access Token ไม่ใช่ User Token");
      }
    } catch (error) {
      toast.error("ไม่สามารถตรวจสอบ Token ได้");
      console.error(error);
    } finally {
      setIsCheckingToken(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!pageName || !pageId || !pageAccessToken) {
      toast.error("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    if (tokenInfo?.debug?.type !== "PAGE") {
      toast.error("กรุณาตรวจสอบ Token ให้เป็น Page Access Token");
      return;
    }

    if (page) {
      updateMutation.mutate({
        id: page.id,
        pageName,
        pageId,
        pageAccessToken,
      });
    } else {
      createMutation.mutate({
        pageName,
        pageId,
        pageAccessToken,
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-lg border border-white/10 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-slate-900 border-b border-white/10 p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            {page ? "แก้ไข" : "เพิ่ม"} Facebook Page
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="pageName" className="text-white">
              ชื่อ Page
            </Label>
            <Input
              id="pageName"
              placeholder="My Business Page"
              value={pageName}
              onChange={(e) => setPageName(e.target.value)}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pageId" className="text-white">
              Page ID
            </Label>
            <Input
              id="pageId"
              placeholder="123456789012345"
              value={pageId}
              onChange={(e) => setPageId(e.target.value)}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pageAccessToken" className="text-white">
              Page Access Token
            </Label>
            <Input
              id="pageAccessToken"
              type="password"
              placeholder="EAABsbCS1iHgBO..."
              value={pageAccessToken}
              onChange={(e) => {
                setPageAccessToken(e.target.value);
                setTokenInfo(null);
              }}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
              required
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCheckToken}
              disabled={isCheckingToken || !pageAccessToken}
              className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600 mt-2"
            >
              {isCheckingToken ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  กำลังตรวจสอบ...
                </>
              ) : (
                "ตรวจสอบ Token"
              )}
            </Button>

            {tokenInfo && (
              <div
                className="mt-4 p-4 rounded-lg border space-y-3 text-sm"
                style={{
                  backgroundColor:
                    tokenInfo.debug?.type === "PAGE"
                      ? "rgba(34, 197, 94, 0.1)"
                      : "rgba(239, 68, 68, 0.1)",
                  borderColor:
                    tokenInfo.debug?.type === "PAGE"
                      ? "rgba(34, 197, 94, 0.3)"
                      : "rgba(239, 68, 68, 0.3)",
                }}
              >
                <div className="flex items-center gap-2">
                  {tokenInfo.debug?.type === "PAGE" ? (
                    <CheckCircle2 className="h-5 w-5 text-green-400" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-400" />
                  )}
                  <span className="font-semibold text-white">
                    {tokenInfo.debug?.type === "PAGE"
                      ? "✅ Token ถูกต้อง!"
                      : "❌ Token ผิด!"}
                  </span>
                </div>
                <div className="space-y-2 text-white/80">
                  <div>
                    <span className="font-medium">ประเภท:</span>{" "}
                    <span
                      className={
                        tokenInfo.debug?.type === "PAGE"
                          ? "text-green-400"
                          : "text-red-400"
                      }
                    >
                      {tokenInfo.debug?.type || "Unknown"}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">ชื่อ:</span> {tokenInfo.me?.name || "N/A"}
                  </div>
                  <div>
                    <span className="font-medium">ID:</span> {tokenInfo.me?.id || "N/A"}
                  </div>
                </div>
                {tokenInfo.debug?.type !== "PAGE" && (
                  <div className="mt-3 p-3 bg-red-500/10 rounded border border-red-500/30">
                    <p className="text-xs text-red-400 font-medium mb-2">
                      🔴 วิธีแก้ไข:
                    </p>
                    <ol className="text-xs text-red-300 space-y-1 list-decimal list-inside">
                      <li>ไปที่ Graph API Explorer</li>
                      <li>
                        เรียก API: <code className="bg-black/30 px-1 rounded">/me/accounts</code>
                      </li>
                      <li>
                        คัดลอก <code className="bg-black/30 px-1 rounded">access_token</code> ของ
                        Page
                      </li>
                    </ol>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 pt-4">
            <Button
              type="submit"
              disabled={isPending || tokenInfo?.debug?.type !== "PAGE"}
              className="flex-1"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  กำลังบันทึก...
                </>
              ) : (
                "บันทึก"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
              className="flex-1 bg-white/5 border-white/10 text-white hover:bg-white/10"
            >
              ยกเลิก
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

