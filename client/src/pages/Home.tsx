import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Loader2, Sparkles, Calendar, Image as ImageIcon } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";
import { FacebookPageSelector } from "@/components/FacebookPageSelector";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [referenceImage, setReferenceImage] = useState<File | null>(null);
  const [referenceImagePreview, setReferenceImagePreview] = useState<string>("");
  const [caption, setCaption] = useState("");
  const [affiliateLink, setAffiliateLink] = useState("");
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFacebookPageIds, setSelectedFacebookPageIds] = useState<string[]>([]);

  const createPostMutation = trpc.posts.create.useMutation({
    onSuccess: async (data) => {
      toast.success("รูปภาพถูกสร้างเรียบร้อยแล้ว");
      
      // Auto post to social media
      if (platforms.length > 0) {
        try {
          await postToSocialMutation.mutateAsync({
            postId: data.id,
            platforms: platforms as any,
            facebookPageIds: selectedFacebookPageIds.length > 0 ? selectedFacebookPageIds : undefined,
          });
        } catch (error) {
          toast.error("เกิดข้อผิดพลาดในการโพสต์");
        }
      }
      
      // Reset form
      setPrompt("");
      setCaption("");
      setAffiliateLink("");
      setPlatforms([]);
      setSelectedFacebookPageIds([]);
    },
    onError: (error) => {
      toast.error(error.message || "เกิดข้อผิดพลาดในการสร้างรูปภาพ");
    },
  });

  const postToSocialMutation = trpc.posts.postToSocial.useMutation({
    onSuccess: (data) => {
      console.log("Post to social results:", data);
      
      // Check results for each platform
      const successPlatforms: string[] = [];
      const failedPlatforms: string[] = [];
      
      Object.entries(data).forEach(([platform, result]) => {
        const platformResult = result as any;
        if (platformResult.success) {
          successPlatforms.push(platform);
        } else {
          failedPlatforms.push(platform);
          console.error(`${platform} error:`, platformResult.error);
        }
      });
      
      if (successPlatforms.length > 0) {
        toast.success(`โพสต์สำเร็จ: ${successPlatforms.join(", ")}`);
      }
      
      if (failedPlatforms.length > 0) {
        toast.error(`โพสต์ล้มเหลว: ${failedPlatforms.join(", ")}`);
        // Show detailed errors
        failedPlatforms.forEach(platform => {
          const error = data[platform]?.error;
          if (error) {
            toast.error(`${platform}: ${error}`);
          }
        });
      }
    },
    onError: (error) => {
      console.error("Post to social error:", error);
      toast.error(error.message || "เกิดข้อผิดพลาดในการโพสต์");
    },
  });

  const createScheduledMutation = trpc.scheduledPosts.create.useMutation({
    onSuccess: () => {
      toast.success("ตั้งเวลาโพสต์เรียบร้อยแล้ว");
      setPrompt("");
      setCaption("");
      setAffiliateLink("");
      setPlatforms([]);
      setSelectedFacebookPageIds([]);
      setIsScheduled(false);
      setScheduledDate("");
      setScheduledTime("");
    },
    onError: (error) => {
      toast.error(error.message || "เกิดข้อผิดพลาดในการตั้งเวลาโพสต์");
    },
  });

  const handlePlatformToggle = (platform: string) => {
    setPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("ไฟล์รูปภาพต้องไม่เกิน 10MB");
        return;
      }
      setReferenceImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setReferenceImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setReferenceImage(null);
    setReferenceImagePreview("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!prompt.trim()) {
      toast.error("กรุณากรอก prompt");
      return;
    }

    if (platforms.length === 0) {
      toast.error("กรุณาเลือกอย่างน้อย 1 แพลตฟอร์ม");
      return;
    }

    // Upload reference image if provided
    let referenceImageUrl: string | undefined;
    if (referenceImage) {
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", referenceImage);
        
        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        
        if (!uploadResponse.ok) {
          throw new Error("ไม่สามารถอัปโหลดรูปภาพได้");
        }
        
        const uploadData = await uploadResponse.json();
        referenceImageUrl = uploadData.url;
      } catch (error) {
        toast.error("เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ");
        setIsUploading(false);
        return;
      } finally {
        setIsUploading(false);
      }
    }

    if (isScheduled) {
      if (!scheduledDate || !scheduledTime) {
        toast.error("กรุณาระบุวันที่และเวลาที่ต้องการโพสต์");
        return;
      }

      const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
      if (scheduledDateTime <= new Date()) {
        toast.error("เวลาที่ตั้งต้องเป็นอนาคต");
        return;
      }

      createScheduledMutation.mutate({
        prompt,
        referenceImageUrl,
        caption,
        affiliateLink,
        platforms: platforms as any,
        scheduledTime: scheduledDateTime,
      });
    } else {
      createPostMutation.mutate({
        prompt,
        referenceImageUrl,
        caption,
        affiliateLink,
        platforms: platforms as any,
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <img src={APP_LOGO} alt={APP_TITLE} className="h-16 w-16" />
            </div>
            <CardTitle className="text-2xl">{APP_TITLE}</CardTitle>
            <CardDescription>
              สร้างรูปภาพด้วย AI และโพสต์ไปยังโซเชียลมีเดียหลายแพลตฟอร์มพร้อมกัน
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full" size="lg">
              <a href={getLoginUrl()}>เข้าสู่ระบบเพื่อเริ่มใช้งาน</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isLoading = createPostMutation.isPending || postToSocialMutation.isPending || createScheduledMutation.isPending;

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
              <Link href="/history">
                <Button variant="ghost" className="text-white hover:bg-white/10">
                  ประวัติ
                </Button>
              </Link>
              <Link href="/settings">
                <Button variant="ghost" className="text-white hover:bg-white/10">
                  ตั้งค่า
                </Button>
              </Link>
              <span className="text-sm text-white/70">{user?.name}</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Sparkles className="h-5 w-5" />
                สร้างและโพสต์รูปภาพ
              </CardTitle>
              <CardDescription className="text-white/70">
                ใส่ prompt เพื่อสร้างรูปภาพด้วย AI และเลือกแพลตฟอร์มที่ต้องการโพสต์
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="prompt" className="text-white">Prompt สำหรับสร้างรูปภาพ</Label>
                  <Textarea
                    id="prompt"
                    placeholder="เช่น: A serene landscape with mountains at sunset"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-[100px] bg-white/5 border-white/10 text-white placeholder:text-white/40"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reference-image" className="text-white">รูปภาพอ้างอิง (ไม่บังคับ)</Label>
                  <div className="space-y-4">
                    <Input
                      id="reference-image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                      className="bg-white/5 border-white/10 text-white file:text-white"
                    />
                    {referenceImagePreview && (
                      <div className="relative w-full max-w-md">
                        <img
                          src={referenceImagePreview}
                          alt="Reference"
                          className="w-full h-auto rounded-lg border border-white/10"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={handleRemoveImage}
                        >
                          ลบรูป
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="caption" className="text-white">Caption (ไม่บังคับ)</Label>
                  <Textarea
                    id="caption"
                    placeholder="ข้อความที่จะแสดงในโพสต์"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="affiliateLink" className="text-white">ลิงค์ Affiliate (ไม่บังคับ)</Label>
                  <Input
                    id="affiliateLink"
                    type="url"
                    placeholder="https://example.com/affiliate-link"
                    value={affiliateLink}
                    onChange={(e) => setAffiliateLink(e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-white">เลือกแพลตฟอร์มที่ต้องการโพสต์</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: "facebook", label: "Facebook" },
                      { id: "instagram", label: "Instagram" },
                      { id: "x", label: "X (Twitter)" },
                      { id: "tiktok", label: "TikTok" },
                    ].map((platform) => (
                      <div key={platform.id} className="space-y-2">
                        <div className="flex items-center space-x-2 bg-white/5 p-3 rounded-lg border border-white/10">
                          <Checkbox
                            id={platform.id}
                            checked={platforms.includes(platform.id)}
                            onCheckedChange={() => handlePlatformToggle(platform.id)}
                            disabled={isLoading}
                          />
                          <Label htmlFor={platform.id} className="text-white cursor-pointer">
                            {platform.label}
                          </Label>
                        </div>
                        {platform.id === "facebook" && platforms.includes("facebook") && (
                          <FacebookPageSelector
                            selectedPageIds={selectedFacebookPageIds}
                            onChange={setSelectedFacebookPageIds}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 border-t border-white/10 pt-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="scheduled"
                      checked={isScheduled}
                      onCheckedChange={(checked) => setIsScheduled(checked as boolean)}
                      disabled={isLoading}
                    />
                    <Label htmlFor="scheduled" className="text-white cursor-pointer flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      ตั้งเวลาโพสต์
                    </Label>
                  </div>

                  {isScheduled && (
                    <div className="grid grid-cols-2 gap-3 pl-6">
                      <div className="space-y-2">
                        <Label htmlFor="scheduledDate" className="text-white text-sm">วันที่</Label>
                        <Input
                          id="scheduledDate"
                          type="date"
                          value={scheduledDate}
                          onChange={(e) => setScheduledDate(e.target.value)}
                          className="bg-white/5 border-white/10 text-white"
                          disabled={isLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="scheduledTime" className="text-white text-sm">เวลา</Label>
                        <Input
                          id="scheduledTime"
                          type="time"
                          value={scheduledTime}
                          onChange={(e) => setScheduledTime(e.target.value)}
                          className="bg-white/5 border-white/10 text-white"
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      กำลังดำเนินการ...
                    </>
                  ) : isScheduled ? (
                    <>
                      <Calendar className="mr-2 h-4 w-4" />
                      ตั้งเวลาโพสต์
                    </>
                  ) : (
                    <>
                      <ImageIcon className="mr-2 h-4 w-4" />
                      สร้างและโพสต์เลย
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

