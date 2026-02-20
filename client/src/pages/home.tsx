import { useProducts, useCategories } from "@/hooks/use-products";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { ArrowLeft, Star, TrendingUp, ShieldCheck, Truck } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const { data: featuredProducts, isLoading: productsLoading } = useProducts({ featured: true });
  const { data: categories, isLoading: categoriesLoading } = useCategories();

  return (
    <div className="flex flex-col gap-12 pb-12">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden bg-gradient-to-b from-primary/10 to-background">
        <div className="absolute inset-0 z-0">
          {/* Unsplash agricultural background */}
          <div className="absolute inset-0 bg-primary/20 z-10 mix-blend-multiply" />
          <img 
            src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=1740&auto=format&fit=crop" 
            alt="Farm landscape" 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="container relative z-20 px-4 text-center text-white">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto space-y-6"
          >
            <Badge variant="outline" className="bg-white/10 backdrop-blur border-white/20 text-white px-4 py-1 text-sm">
              موسم الزراعة الجديد
            </Badge>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight drop-shadow-lg">
              ازرع مستقبلك مع <span className="text-accent">مشاتل القادري</span>
            </h1>
            <p className="text-lg md:text-xl text-white/90 leading-relaxed drop-shadow-md max-w-2xl mx-auto">
              نوفر لك في مشاتل القادري أفضل البذور والأسمدة والمعدات الزراعية لتضمن محصولاً وفيراً وجودة عالية.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/products">
                <Button size="lg" className="bg-accent hover:bg-accent/90 text-white border-0 text-lg px-8 py-6 h-auto">
                  تسوق الآن <ArrowLeft className="mr-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/about">
                <Button size="lg" variant="outline" className="bg-white/10 backdrop-blur hover:bg-white/20 border-white text-white text-lg px-8 py-6 h-auto">
                  تعرف علينا
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="container px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: ShieldCheck, title: "جودة مضمونة", desc: "منتجات أصلية 100% من أفضل العلامات التجارية العالمية" },
            { icon: Truck, title: "توصيل سريع", desc: "خدمة توصيل سريعة وموثوقة لجميع مناطق المملكة" },
            { icon: TrendingUp, title: "أسعار تنافسية", desc: "أفضل الأسعار في السوق مع عروض موسمية مستمرة" },
          ].map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col items-center text-center p-6 bg-card rounded-2xl shadow-sm border border-border/50 hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="container px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">الأقسام الرئيسية</h2>
          <Link href="/products">
            <Button variant="ghost" className="text-primary hover:text-primary/80">عرض الكل</Button>
          </Link>
        </div>
        
        {categoriesLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-40 bg-muted rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories?.slice(0, 4).map((category, i) => (
              <Link key={category.id} href={`/products?category=${category.id}`}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="group relative h-48 rounded-2xl overflow-hidden cursor-pointer bg-black/5"
                >
                  <img 
                    src={category.imageUrl || `https://source.unsplash.com/random/400x400?agriculture,${i}`} 
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6">
                    <h3 className="text-white font-bold text-xl">{category.name}</h3>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Featured Products */}
      <section className="container px-4 bg-secondary/30 py-16 rounded-3xl">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-primary">منتجات مميزة</h2>
          <Link href="/products?featured=true">
            <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">تصفح المميز</Button>
          </Link>
        </div>

        {productsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-80 bg-white rounded-2xl animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts?.slice(0, 4).map((product) => (
              <Link key={product.id} href={`/products/${product.id}`}>
                <Card className="h-full border-border/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden group">
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    <img 
                      src={product.imageUrl} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {product.discountPrice && (
                      <Badge className="absolute top-2 right-2 bg-destructive text-white">
                        خصم {Math.round(((Number(product.price) - Number(product.discountPrice)) / Number(product.price)) * 100)}%
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground">{product.category.name}</span>
                      <div className="flex items-center text-yellow-500 text-xs">
                        <Star className="w-3 h-3 fill-current mr-1" />
                        <span>{product.rating}</span>
                      </div>
                    </div>
                    <h3 className="font-bold text-lg mb-2 line-clamp-1">{product.name}</h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold text-primary">{product.discountPrice || product.price} ر.س</span>
                      {product.discountPrice && (
                        <span className="text-sm text-muted-foreground line-through">{product.price} ر.س</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="container px-4 text-center py-16">
        <div className="bg-primary text-primary-foreground rounded-3xl p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
          
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">هل أنت مستعد لبدء موسم الحصاد؟</h2>
            <p className="text-primary-foreground/80 text-lg">
              انضم إلى آلاف المزارعين الذين يثقون في منتجاتنا. سجل الآن واحصل على عروض حصرية.
            </p>
            <Link href="/api/login">
              <Button size="lg" variant="secondary" className="text-primary font-bold text-lg px-8">
                انشاء حساب مجاني
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
