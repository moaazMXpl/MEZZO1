# دليل البدء السريع - MEZZO

## المتطلبات الأساسية

### 1. تثبيت Node.js
- اذهب إلى [nodejs.org](https://nodejs.org/)
- حمّل النسخة LTS (النسخة الموصى بها)
- ثبتها واتبع التعليمات
- افتح Terminal/PowerShell جديد واكتب:
```bash
node --version
npm --version
```
يجب أن ترى أرقام الإصدارات

---

## خطوات تجربة المشروع

### الخطوة 1: تثبيت المكتبات
```bash
npm install
```

### الخطوة 2: إعداد Supabase

#### أ) إنشاء حساب ومشروع:
1. اذهب إلى: https://app.supabase.com
2. سجل دخول (يمكنك استخدام GitHub)
3. اضغط **New Project**
4. اختر:
   - **Organization**: اختر أو أنشئ واحدة
   - **Name**: أي اسم (مثلاً: mezzo-project)
   - **Database Password**: اختر كلمة مرور قوية واحفظها
   - **Region**: اختر الأقرب لك
5. اضغط **Create new project**
6. انتظر دقيقة أو دقيقتين حتى يكتمل الإعداد

#### ب) الحصول على بيانات الاتصال:
1. بعد اكتمال الإعداد، اذهب إلى **Settings** (في القائمة الجانبية)
2. اضغط على **API**
3. انسخ:
   - **Project URL** (مثل: `https://xxxxx.supabase.co`)
   - **anon public** key (مفتاح طويل يبدأ بـ `eyJ...`)

#### ج) إنشاء ملف .env:
1. في مجلد المشروع، افتح ملف `.env` (أو أنشئه إذا لم يكن موجوداً)
2. أضف السطرين التاليين (استبدل بالقيم الحقيقية):

```
VITE_SUPABASE_URL=الصق_Project_URL_هنا
VITE_SUPABASE_ANON_KEY=الصق_anon_public_key_هنا
```

مثال:
```
VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxOTMxODE1MDIyfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### الخطوة 3: إعداد قاعدة البيانات

1. في Supabase Dashboard، اضغط على **SQL Editor** (في القائمة الجانبية)
2. اضغط **New Query**
3. افتح ملف `supabase/migrations/20260112151717_create_mezzo_schema.sql` من المشروع
4. انسخ **كل** محتوى الملف والصقه في SQL Editor
5. اضغط **Run** (أو F5)
6. يجب أن ترى رسالة نجاح
7. كرر نفس الخطوات مع ملف `supabase/migrations/20260113122429_add_cheat_code_setting.sql`

### الخطوة 4: إضافة بيانات تجريبية

في SQL Editor، نفذ الاستعلام التالي لإضافة بيانات تجريبية:

```sql
-- إضافة فئات
INSERT INTO categories (name, name_en, display_order, is_active, image_url) VALUES
('مشروبات', 'Drinks', 1, true, ''),
('وجبات', 'Meals', 2, true, ''),
('حلويات', 'Desserts', 3, true, '')
ON CONFLICT DO NOTHING;

-- الحصول على معرفات الفئات (ستحتاجها لإضافة المنتجات)
-- بعد تنفيذ الاستعلام أعلاه، نفذ هذا لرؤية المعرفات:
SELECT id, name FROM categories;

-- إضافة منتجات (استبدل category_id بالقيم الحقيقية من الاستعلام أعلاه)
-- احصل على category_id من الاستعلام السابق
INSERT INTO items (category_id, name, name_en, price, display_order, is_active, is_available, image_url) VALUES
-- استبدل 'category-id-here' بمعرف الفئة الفعلي
((SELECT id FROM categories WHERE name = 'مشروبات' LIMIT 1), 'قهوة عربية', 'Arabic Coffee', 15.00, 1, true, true, ''),
((SELECT id FROM categories WHERE name = 'مشروبات' LIMIT 1), 'شاي', 'Tea', 10.00, 2, true, true, ''),
((SELECT id FROM categories WHERE name = 'مشروبات' LIMIT 1), 'عصير برتقال', 'Orange Juice', 12.00, 3, true, true, ''),
((SELECT id FROM categories WHERE name = 'وجبات' LIMIT 1), 'برجر', 'Burger', 35.00, 1, true, true, ''),
((SELECT id FROM categories WHERE name = 'وجبات' LIMIT 1), 'بيتزا', 'Pizza', 45.00, 2, true, true, ''),
((SELECT id FROM categories WHERE name = 'حلويات' LIMIT 1), 'كيك', 'Cake', 25.00, 1, true, true, ''),
((SELECT id FROM categories WHERE name = 'حلويات' LIMIT 1), 'آيس كريم', 'Ice Cream', 20.00, 2, true, true, '')
ON CONFLICT DO NOTHING;

-- إضافة إعدادات
INSERT INTO settings (key, value) VALUES
('cheat_code', 'admin123123'),
('instant_transfer_number', '0501234567')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
```

### الخطوة 5: تشغيل المشروع

```bash
npm run dev
```

سيفتح المتصفح تلقائياً على `http://localhost:5173`

إذا لم يفتح تلقائياً، افتح المتصفح واكتب: `http://localhost:5173`

---

## تجربة المشروع

### كعميل عادي:
1. **تصفح القوائم**: ستظهر الفئات والمنتجات التي أضفتها
2. **أضف منتجات**: اضغط على أي منتج لإضافته إلى السلة
3. **عرض السلة**: اضغط على أيقونة السلة في الأعلى
4. **إتمام الطلب**: اضغط "إتمام الطلب" واملأ البيانات
5. **تأكيد الطلب**: اضغط "تأكيد الطلب"

### كمسؤول (Operator):
1. في الصفحة الرئيسية، اضغط على أي مكان فارغ **5 مرات متتالية**
2. سيظهر حقل لإدخال Cheat Code
3. أدخل: `admin123123`
4. اضغط Enter
5. سجل دخول (يمكنك استخدام أي بيانات - النظام بسيط)
6. الآن يمكنك:
   - **إدارة المنتجات**: إضافة/تعديل/حذف المنتجات والفئات
   - **إدارة الطلبات**: عرض الطلبات وتغيير حالتها
   - **الإحصائيات**: عرض إحصائيات المبيعات
   - **الإعدادات**: تغيير Cheat Code ورقم التحويل الفوري

---

## استكشاف الأخطاء

### ❌ "npm is not recognized"
**الحل**: Node.js غير مثبت. ثبت Node.js من [nodejs.org](https://nodejs.org/)

### ❌ "Missing Supabase environment variables"
**الحل**: تأكد من وجود ملف `.env` بالقيم الصحيحة

### ❌ خطأ في إنشاء الطلب
**الحل**: 
- تأكد من تنفيذ migrations قاعدة البيانات
- تحقق من Console (F12) لرؤية الخطأ التفصيلي
- تأكد من اتصال الإنترنت

### ❌ لا تظهر المنتجات
**الحل**:
- تأكد من إضافة بيانات في قاعدة البيانات
- تأكد من أن `is_active = true` في جداول `items` و `categories`

### ❌ الصفحة بيضاء
**الحل**:
- افتح Console (F12) وابحث عن أخطاء
- تأكد من تثبيت المكتبات: `npm install`
- أعد تشغيل الخادم: اضغط Ctrl+C ثم `npm run dev`

---

## نصائح مفيدة

✅ استخدم Supabase Dashboard لمراقبة البيانات والطلبات في الوقت الفعلي

✅ يمكنك إضافة صور للمنتجات عبر تحديث `image_url` في جدول `items`

✅ يمكنك تفعيل/تعطيل المنتجات من لوحة التحكم

✅ جميع الطلبات تظهر في لوحة التحكم للمسؤول

---

## الدعم

إذا واجهت أي مشاكل:
1. تحقق من Console في المتصفح (F12)
2. تحقق من Terminal/PowerShell للأخطاء
3. تأكد من اتباع جميع الخطوات بالترتيب
