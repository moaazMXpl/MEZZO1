# دليل تجربة المشروع - MEZZO

## الخطوة 1: تثبيت المكتبات

```bash
npm install
```

## الخطوة 2: إعداد Supabase

### أ) إنشاء حساب Supabase
1. اذهب إلى [Supabase](https://app.supabase.com)
2. سجل دخول أو أنشئ حساب جديد (مجاني)
3. اضغط على "New Project"

### ب) الحصول على بيانات الاتصال
1. بعد إنشاء المشروع، انتظر حتى يكتمل الإعداد (دقيقة أو دقيقتين)
2. اذهب إلى **Settings** (الإعدادات) في القائمة الجانبية
3. اضغط على **API**
4. ستجد:
   - **Project URL** - انسخه
   - **anon public** key - انسخه

### ج) إعداد ملف .env
1. افتح ملف `.env` في المجلد الرئيسي للمشروع
2. أضف القيم التالية (استبدل بالقيم الحقيقية من Supabase):

```
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## الخطوة 3: إعداد قاعدة البيانات

1. في Supabase Dashboard، اذهب إلى **SQL Editor**
2. اضغط على **New Query**
3. افتح ملف `supabase/migrations/20260112151717_create_mezzo_schema.sql`
4. انسخ محتواه بالكامل والصقه في SQL Editor
5. اضغط **Run** (أو F5)
6. كرر نفس الخطوات مع ملف `supabase/migrations/20260113122429_add_cheat_code_setting.sql`

## الخطوة 4: إضافة بيانات تجريبية (اختياري)

### إضافة فئات:
```sql
INSERT INTO categories (name, name_en, display_order, is_active) VALUES
('مشروبات', 'Drinks', 1, true),
('وجبات', 'Meals', 2, true),
('حلويات', 'Desserts', 3, true);
```

### إضافة منتجات:
```sql
-- احصل على category_id من الفئات التي أضفتها
INSERT INTO items (category_id, name, name_en, price, display_order, is_active, is_available) VALUES
('category-id-here', 'قهوة', 'Coffee', 15.00, 1, true, true),
('category-id-here', 'شاي', 'Tea', 10.00, 2, true, true);
```

## الخطوة 5: تشغيل المشروع

```bash
npm run dev
```

سيفتح المتصفح تلقائياً على `http://localhost:5173`

## الخطوة 6: تجربة المشروع

### كعميل:
1. تصفح القوائم والمنتجات
2. أضف منتجات إلى السلة
3. اضغط على أيقونة السلة
4. اضغط "إتمام الطلب"
5. املأ بياناتك واضغط "تأكيد الطلب"

### كمسؤول (Operator):
1. في الصفحة الرئيسية، اضغط على أي مكان فارغ عدة مرات
2. سيظهر حقل لإدخال Cheat Code
3. أدخل الكود الافتراضي: `admin123123` (أو الكود الذي عينته في الإعدادات)
4. سجل دخول كمسؤول
5. يمكنك الآن:
   - إدارة المنتجات والفئات
   - عرض وإدارة الطلبات
   - عرض الإحصائيات
   - تغيير الإعدادات

## استكشاف الأخطاء

### المشروع لا يعمل:
- تأكد من تثبيت المكتبات: `npm install`
- تأكد من وجود ملف `.env` بالقيم الصحيحة
- أعد تشغيل الخادم بعد تعديل `.env`

### خطأ في إنشاء الطلب:
- تأكد من إعداد Supabase بشكل صحيح
- تأكد من تنفيذ migrations قاعدة البيانات
- تحقق من Console في المتصفح (F12) لرؤية الأخطاء

### لا تظهر المنتجات:
- تأكد من إضافة بيانات في قاعدة البيانات
- تأكد من أن `is_active = true` في جدول `items` و `categories`

## نصائح إضافية

- استخدم Supabase Dashboard لمراقبة البيانات والطلبات
- يمكنك إضافة صور للمنتجات عبر `image_url` في قاعدة البيانات
- يمكنك تفعيل/تعطيل المنتجات من لوحة التحكم
