import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { APP_LOGO, APP_TITLE } from "@/const";
import { trpc } from "@/lib/trpc";
import { Loader2, ArrowLeft, Clock, CheckCircle, XCircle, Calendar, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function History() {
  const { user } = useAuth();
  const utils = trpc.useUtils();

  const { data: posts, isLoading: postsLoading } = trpc.posts.list.useQuery();
  const { data: scheduledPosts, isLoading: scheduledLoading } = trpc.scheduledPosts.list.useQuery();

  const deleteScheduledMutation = trpc.scheduledPosts.delete.useMutation({
    onSuccess: () => {
      toast.success("ลบโพสต์ที่ตั้งเวลาไว้เรียบร้อยแล้ว");
      utils.scheduledPosts.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "เกิดข้อผิดพลาดในการลบ");
    },
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      draft: { variant: "secondary", label: "แบบร่าง" },
      generating: { variant: "default", label: "กำลังสร้าง" },
      ready: { variant: "outline", label: "พร้อมโพสต์" },
      posting: { variant: "default", label: "กำลังโพสต์" },
      completed: { variant: "default", label: "สำเร็จ" },
      failed: { variant: "destructive", label: "ล้มเหลว" },
      pending: { variant: "secondary", label: "รอดำเนินการ" },
      processing: { variant: "default", label: "กำลังประมวลผล" },
    };

    const config = variants[status] || { variant: "outline" as const, label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "-";
    const d = new Date(date);
    return d.toLocaleString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPlatformBadges = (post: any) => {
    const platforms = [];
    if (post.postedToFacebook) platforms.push("Facebook");
    if (post.postedToInstagram) platforms.push("Instagram");
    if (post.postedToX) platforms.push("X");
    if (post.postedToTiktok) platforms.push("TikTok");
    return platforms;
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
        <div className="max-w-5xl mx-auto">
          <Tabs defaultValue="posts" className="space-y-6">
            <TabsList className="bg-black/40 border border-white/10">
              <TabsTrigger value="posts" className="data-[state=active]:bg-white/10">
                <Clock className="mr-2 h-4 w-4" />
                ประวัติโพสต์
              </TabsTrigger>
              <TabsTrigger value="scheduled" className="data-[state=active]:bg-white/10">
                <Calendar className="mr-2 h-4 w-4" />
                โพสต์ที่ตั้งเวลาไว้
              </TabsTrigger>
            </TabsList>

            <TabsContent value="posts">
              <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">ประวัติโพสต์</CardTitle>
                  <CardDescription className="text-white/70">
                    รายการโพสต์ทั้งหมดที่คุณสร้างและโพสต์แล้ว
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {postsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-white" />
                    </div>
                  ) : !posts || posts.length === 0 ? (
                    <div className="text-center py-8 text-white/50">
                      ยังไม่มีประวัติโพสต์
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {posts.map((post) => (
                        <div
                          key={post.id}
                          className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 space-y-2">
                              <p className="text-white font-medium">{post.prompt}</p>
                              {post.caption && (
                                <p className="text-sm text-white/70">{post.caption}</p>
                              )}
                              {post.imageUrl && (
                                <img
                                  src={post.imageUrl}
                                  alt="Generated"
                                  className="w-full max-w-md rounded-lg border border-white/10"
                                />
                              )}
                            </div>
                            <div>{getStatusBadge(post.status)}</div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {getPlatformBadges(post).map((platform) => (
                              <Badge key={platform} variant="outline" className="text-white/70">
                                <CheckCircle className="mr-1 h-3 w-3" />
                                {platform}
                              </Badge>
                            ))}
                          </div>

                          <div className="text-xs text-white/50">
                            สร้างเมื่อ: {formatDate(post.createdAt)}
                          </div>

                          {post.errorMessage && (
                            <div className="flex items-start gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded p-2">
                              <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                              <span>{post.errorMessage}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="scheduled">
              <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">โพสต์ที่ตั้งเวลาไว้</CardTitle>
                  <CardDescription className="text-white/70">
                    รายการโพสต์ที่กำหนดเวลาไว้และรอการโพสต์อัตโนมัติ
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {scheduledLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-white" />
                    </div>
                  ) : !scheduledPosts || scheduledPosts.length === 0 ? (
                    <div className="text-center py-8 text-white/50">
                      ยังไม่มีโพสต์ที่ตั้งเวลาไว้
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {scheduledPosts.map((scheduled) => {
                        const platforms = JSON.parse(scheduled.platforms || "[]");
                        return (
                          <div
                            key={scheduled.id}
                            className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1 space-y-2">
                                <p className="text-white font-medium">{scheduled.prompt}</p>
                                {scheduled.caption && (
                                  <p className="text-sm text-white/70">{scheduled.caption}</p>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                {getStatusBadge(scheduled.status)}
                                {scheduled.status === "pending" && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => deleteScheduledMutation.mutate({ id: scheduled.id })}
                                    disabled={deleteScheduledMutation.isPending}
                                  >
                                    <Trash2 className="h-4 w-4 text-red-400" />
                                  </Button>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {platforms.map((platform: string) => (
                                <Badge key={platform} variant="outline" className="text-white/70">
                                  {platform}
                                </Badge>
                              ))}
                            </div>

                            <div className="flex items-center gap-2 text-sm text-white/70">
                              <Calendar className="h-4 w-4" />
                              กำหนดโพสต์: {formatDate(scheduled.scheduledTime)}
                            </div>

                            {scheduled.errorMessage && (
                              <div className="flex items-start gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded p-2">
                                <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                <span>{scheduled.errorMessage}</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

