import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { APP_LOGO, APP_TITLE } from "@/const";
import { trpc } from "@/lib/trpc";
import { Loader2, Save, ArrowLeft, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";
import { FacebookPagesList } from "@/components/FacebookPagesList";

export default function Settings() {
  const { user } = useAuth();
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [facebookPageId, setFacebookPageId] = useState("");
  const [facebookToken, setFacebookToken] = useState("");
  const [instagramUserId, setInstagramUserId] = useState("");
  const [instagramToken, setInstagramToken] = useState("");
  const [xToken, setXToken] = useState("");
  const [uploadPostApiKey, setUploadPostApiKey] = useState("");
  const [uploadPostUser, setUploadPostUser] = useState("");
  const [isCheckingToken, setIsCheckingToken] = useState(false);
  const [tokenInfo, setTokenInfo] = useState<any>(null);

  const { data: apiConfig, isLoading } = trpc.apiConfig.get.useQuery();

  useEffect(() => {
    if (apiConfig) {
      setGeminiApiKey(apiConfig.geminiApiKey || "");
      setFacebookPageId(apiConfig.facebookPageId || "");
      setFacebookToken(apiConfig.facebookToken || "");
      setInstagramUserId(apiConfig.instagramUserId || "");
      setInstagramToken(apiConfig.instagramToken || "");
      setXToken(apiConfig.xToken || "");
      setUploadPostApiKey(apiConfig.uploadPostApiKey || "");
      setUploadPostUser(apiConfig.uploadPostUser || "");
    }
  }, [apiConfig]);

  const saveMutation = trpc.apiConfig.save.useMutation({
    onSuccess: () => {
      toast.success("บันทึกการตั้งค่าเรียบร้อยแล้ว");
    },
    onError: (error) => {
      toast.error(error.message || "เกิดข้อผิดพลาดในการบันทึก");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate({
      geminiApiKey: geminiApiKey || undefined,
      facebookPageId: facebookPageId || undefined,
      facebookToken: facebookToken || undefined,
      instagramUserId: instagramUserId || undefined,
      instagramToken: instagramToken || undefined,
      xToken: xToken || undefined,
      uploadPostApiKey: uploadPostApiKey || undefined,
      uploadPostUser: uploadPostUser || undefined,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <nav className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src={APP_LOGO} alt={APP_TITLE} className="h-8 w-8" />
              <span className="text-xl font-bold text-white">{APP_TITLE}</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" className="text-white hover:bg-white/10">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  กลับ
                </Button>
              </Link>
              <span className="text-sm text-white/70">{user?.name}</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">ตั้งค่า API</CardTitle>
              <CardDescription className="text-white/70">
                กรอก API keys สำหรับบริการต่างๆ ที่ต้องการใช้งาน
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-white" />
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">สร้างรูปภาพ AI</h3>
                    <div className="space-y-2">
                      <Label htmlFor="geminiApiKey" className="text-white">
                        Google Gemini API Key
                      </Label>
                      <Input
                        id="geminiApiKey"
                        type="password"
                        placeholder="AIza..."
                        value={geminiApiKey}
                        onChange={(e) => setGeminiApiKey(e.target.value)}
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                      />
                      <p className="text-xs text-white/50">
                        รับ API key ได้ที่{" "}
                        <a
                          href="https://aistudio.google.com/apikey"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline hover:text-white/70"
                        >
                          Google AI Studio
                        </a>
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 border-t border-white/10 pt-6">
                    <h3 className="text-lg font-semibold text-white">Facebook Pages</h3>
                    <p className="text-sm text-white/60">
                      จัดการ Facebook Pages สำหรับโพสต์ (รองรับหลาย Pages)
                    </p>
                    <FacebookPagesList />
                  </div>

                  <div className="space-y-4 border-t border-white/10 pt-6">
                    <h3 className="text-lg font-semibold text-white">Facebook (เก่า - จะถูกลบในอนาคต)</h3>
                    <div className="space-y-2">
                      <Label htmlFor="facebookPageId" className="text-white">
                        Page ID
                      </Label>
                      <Input
                        id="facebookPageId"
                        placeholder="123456789"
                        value={facebookPageId}
                        onChange={(e) => setFacebookPageId(e.target.value)}
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="facebookToken" className="text-white">
                        Page Access Token
                      </Label>
                      <Input
                        id="facebookToken"
                        type="password"
                        placeholder="EAAxxxxx..."
                        value={facebookToken}
                        onChange={(e) => {
                          setFacebookToken(e.target.value);
                          setTokenInfo(null);
                        }}
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          if (!facebookToken) {
                            toast.error("กรุณากรอก Access Token ก่อน");
                            return;
                          }
                          setIsCheckingToken(true);
                          setTokenInfo(null);
                          try {
                            // Check token info
                            const debugResponse = await fetch(
                              `https://graph.facebook.com/debug_token?input_token=${facebookToken}&access_token=${facebookToken}`
                            );
                            const debugData = await debugResponse.json();
                            
                            // Get token owner info
                            const meResponse = await fetch(
                              `https://graph.facebook.com/v18.0/me?access_token=${facebookToken}`
                            );
                            const meData = await meResponse.json();
                            
                            setTokenInfo({
                              debug: debugData.data,
                              me: meData,
                            });
                            
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
                        }}
                        disabled={isCheckingToken || !facebookToken}
                        className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
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
                        <div className="mt-4 p-4 rounded-lg border space-y-3 text-sm" style={{
                          backgroundColor: tokenInfo.debug?.type === "PAGE" ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
                          borderColor: tokenInfo.debug?.type === "PAGE" ? "rgba(34, 197, 94, 0.3)" : "rgba(239, 68, 68, 0.3)"
                        }}>
                          <div className="flex items-center gap-2">
                            {tokenInfo.debug?.type === "PAGE" ? (
                              <CheckCircle2 className="h-5 w-5 text-green-400" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-400" />
                            )}
                            <span className="font-semibold text-white">
                              {tokenInfo.debug?.type === "PAGE" ? "✅ Token ถูกต้อง!" : "❌ Token ผิด!"}
                            </span>
                          </div>
                          <div className="space-y-2 text-white/80">
                            <div>
                              <span className="font-medium">ประเภท:</span>{" "}
                              <span className={tokenInfo.debug?.type === "PAGE" ? "text-green-400" : "text-red-400"}>
                                {tokenInfo.debug?.type || "Unknown"}
                              </span>
                              {tokenInfo.debug?.type !== "PAGE" && (
                                <span className="block text-xs text-red-400 mt-1">
                                  ⚠️ ต้องใช้ Page Access Token ไม่ใช่ User Token!
                                </span>
                              )}
                            </div>
                            <div>
                              <span className="font-medium">ชื่อ:</span> {tokenInfo.me?.name || "N/A"}
                            </div>
                            <div>
                              <span className="font-medium">ID:</span> {tokenInfo.me?.id || "N/A"}
                            </div>
                            {tokenInfo.debug?.expires_at && (
                              <div>
                                <span className="font-medium">หมดอายุ:</span>{" "}
                                {tokenInfo.debug.expires_at === 0
                                  ? "ไม่หมดอายุ"
                                  : new Date(tokenInfo.debug.expires_at * 1000).toLocaleString("th-TH")}
                              </div>
                            )}
                            {tokenInfo.debug?.scopes && (
                              <div>
                                <span className="font-medium">Permissions:</span>
                                <div className="mt-1 flex flex-wrap gap-1">
                                  {tokenInfo.debug.scopes.map((scope: string) => (
                                    <span
                                      key={scope}
                                      className="px-2 py-0.5 rounded text-xs"
                                      style={{
                                        backgroundColor: scope === "pages_manage_posts" ? "rgba(34, 197, 94, 0.2)" : "rgba(255, 255, 255, 0.1)",
                                        color: scope === "pages_manage_posts" ? "rgb(134, 239, 172)" : "rgba(255, 255, 255, 0.7)"
                                      }}
                                    >
                                      {scope}
                                    </span>
                                  ))}
                                </div>
                                {!tokenInfo.debug.scopes.includes("pages_manage_posts") && (
                                  <div className="mt-2 flex items-start gap-2 text-yellow-400">
                                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                    <span className="text-xs">
                                      ⚠️ ไม่มี permission "pages_manage_posts" จะโพสต์ไม่ได้!
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          {tokenInfo.debug?.type !== "PAGE" && (
                            <div className="mt-3 p-3 bg-red-500/10 rounded border border-red-500/30">
                              <p className="text-xs text-red-400 font-medium mb-2">
                                🔴 วิธีแก้ไข:
                              </p>
                              <ol className="text-xs text-red-300 space-y-1 list-decimal list-inside">
                                <li>ไปที่ Graph API Explorer</li>
                                <li>เรียก API: <code className="bg-black/30 px-1 rounded">/me/accounts</code></li>
                                <li>คัดลอก <code className="bg-black/30 px-1 rounded">access_token</code> ของ Page</li>
                              </ol>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4 border-t border-white/10 pt-6">
                    <h3 className="text-lg font-semibold text-white">Instagram</h3>
                    <div className="space-y-2">
                      <Label htmlFor="instagramUserId" className="text-white">
                        User ID
                      </Label>
                      <Input
                        id="instagramUserId"
                        placeholder="123456789"
                        value={instagramUserId}
                        onChange={(e) => setInstagramUserId(e.target.value)}
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="instagramToken" className="text-white">
                        Access Token
                      </Label>
                      <Input
                        id="instagramToken"
                        type="password"
                        placeholder="IGQxxxxx..."
                        value={instagramToken}
                        onChange={(e) => setInstagramToken(e.target.value)}
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                      />
                    </div>
                  </div>

                  <div className="space-y-4 border-t border-white/10 pt-6">
                    <h3 className="text-lg font-semibold text-white">X (Twitter)</h3>
                    <div className="space-y-2">
                      <Label htmlFor="xToken" className="text-white">
                        Bearer Token
                      </Label>
                      <Input
                        id="xToken"
                        type="password"
                        placeholder="AAAAAxxxxx..."
                        value={xToken}
                        onChange={(e) => setXToken(e.target.value)}
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                      />
                    </div>
                  </div>

                  <div className="space-y-4 border-t border-white/10 pt-6">
                    <h3 className="text-lg font-semibold text-white">TikTok (via Upload-Post.com)</h3>
                    <div className="space-y-2">
                      <Label htmlFor="uploadPostApiKey" className="text-white">
                        API Key
                      </Label>
                      <Input
                        id="uploadPostApiKey"
                        type="password"
                        placeholder="up_xxxxx..."
                        value={uploadPostApiKey}
                        onChange={(e) => setUploadPostApiKey(e.target.value)}
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="uploadPostUser" className="text-white">
                        User ID
                      </Label>
                      <Input
                        id="uploadPostUser"
                        placeholder="username"
                        value={uploadPostUser}
                        onChange={(e) => setUploadPostUser(e.target.value)}
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                      />
                    </div>
                    <p className="text-xs text-white/50">
                      สมัครและรับ API key ได้ที่{" "}
                      <a
                        href="https://upload-post.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-white/70"
                      >
                        Upload-Post.com
                      </a>
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={saveMutation.isPending}
                  >
                    {saveMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        กำลังบันทึก...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        บันทึกการตั้งค่า
                      </>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

