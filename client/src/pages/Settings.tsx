import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { APP_LOGO, APP_TITLE } from "@/const";
import { trpc } from "@/lib/trpc";
import { Loader2, Save, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";

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
                    <h3 className="text-lg font-semibold text-white">Facebook</h3>
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
                        onChange={(e) => setFacebookToken(e.target.value)}
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                      />
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

