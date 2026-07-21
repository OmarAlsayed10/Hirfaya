ALTER TABLE "JobCategory" ADD COLUMN "nameAr" TEXT;
ALTER TABLE "JobRole" ADD COLUMN "nameAr" TEXT;

UPDATE "JobCategory" SET "nameAr" = "name";
UPDATE "JobRole" SET "nameAr" = "name";

UPDATE "JobCategory"
SET "nameAr" = CASE "name"
  WHEN 'Software & Technology' THEN 'البرمجيات والتكنولوجيا'
  WHEN 'Biology & Life Sciences' THEN 'الأحياء وعلوم الحياة'
  WHEN 'Healthcare' THEN 'الرعاية الصحية'
  WHEN 'Business & Finance' THEN 'الأعمال والتمويل'
  WHEN 'Engineering' THEN 'الهندسة'
  WHEN 'Education & Research' THEN 'التعليم والبحث العلمي'
  ELSE "nameAr"
END;

UPDATE "JobRole"
SET "nameAr" = CASE "name"
  WHEN 'Frontend Developer' THEN 'مطور واجهات أمامية'
  WHEN 'Backend Developer' THEN 'مطور أنظمة خلفية'
  WHEN 'Full Stack Developer' THEN 'مطور ويب متكامل'
  WHEN 'Mobile Developer' THEN 'مطور تطبيقات جوال'
  WHEN 'DevOps Engineer' THEN 'مهندس ديف أوبس'
  WHEN 'Data Engineer' THEN 'مهندس بيانات'
  WHEN 'QA Engineer' THEN 'مهندس ضمان جودة'
  WHEN 'UI/UX Designer' THEN 'مصمم واجهات وتجربة مستخدم'
  WHEN 'Cybersecurity Analyst' THEN 'محلل أمن سيبراني'
  WHEN 'Biologist' THEN 'عالم أحياء'
  WHEN 'Molecular Biologist' THEN 'عالم أحياء جزيئية'
  WHEN 'Microbiologist' THEN 'عالم أحياء دقيقة'
  WHEN 'Biotechnologist' THEN 'أخصائي تقنية حيوية'
  WHEN 'Bioinformatics Analyst' THEN 'محلل معلوماتية حيوية'
  WHEN 'Laboratory Technician' THEN 'فني مختبر'
  WHEN 'Research Assistant' THEN 'مساعد باحث'
  WHEN 'Doctor' THEN 'طبيب'
  WHEN 'Nurse' THEN 'ممرض'
  WHEN 'Pharmacist' THEN 'صيدلي'
  WHEN 'Medical Laboratory Scientist' THEN 'أخصائي مختبرات طبية'
  WHEN 'Physiotherapist' THEN 'أخصائي علاج طبيعي'
  WHEN 'Accountant' THEN 'محاسب'
  WHEN 'Financial Analyst' THEN 'محلل مالي'
  WHEN 'Business Analyst' THEN 'محلل أعمال'
  WHEN 'Sales Representative' THEN 'مندوب مبيعات'
  WHEN 'Marketing Specialist' THEN 'أخصائي تسويق'
  WHEN 'HR Specialist' THEN 'أخصائي موارد بشرية'
  WHEN 'Project Manager' THEN 'مدير مشروع'
  WHEN 'Civil Engineer' THEN 'مهندس مدني'
  WHEN 'Mechanical Engineer' THEN 'مهندس ميكانيكا'
  WHEN 'Electrical Engineer' THEN 'مهندس كهرباء'
  WHEN 'Chemical Engineer' THEN 'مهندس كيميائي'
  WHEN 'Architect' THEN 'مهندس معماري'
  WHEN 'Teacher' THEN 'معلم'
  WHEN 'Lecturer' THEN 'محاضر'
  WHEN 'Academic Researcher' THEN 'باحث أكاديمي'
  WHEN 'Instructional Designer' THEN 'مصمم تعليمي'
  ELSE "nameAr"
END;

ALTER TABLE "JobCategory" ALTER COLUMN "nameAr" SET NOT NULL;
ALTER TABLE "JobRole" ALTER COLUMN "nameAr" SET NOT NULL;

INSERT INTO "JobCategory" ("id", "name", "nameAr", "updatedAt")
VALUES ('cat-3d-design', '3D Design & Visualization', 'التصميم والتصور ثلاثي الأبعاد', CURRENT_TIMESTAMP)
ON CONFLICT ("name") DO UPDATE
SET "nameAr" = EXCLUDED."nameAr", "updatedAt" = CURRENT_TIMESTAMP;

INSERT INTO "JobRole" ("id", "categoryId", "name", "nameAr", "updatedAt")
SELECT role_seed."id", category."id", role_seed."name", role_seed."nameAr", CURRENT_TIMESTAMP
FROM (
  VALUES
    ('role-3d-artist', '3D Artist', 'فنان ثلاثي الأبعاد'),
    ('role-blender-artist', 'Blender Artist', 'فنان بلندر'),
    ('role-3d-modeler', '3D Modeler', 'مصمم نماذج ثلاثية الأبعاد'),
    ('role-3d-animator', '3D Animator', 'محرك رسوم ثلاثية الأبعاد'),
    ('role-motion-graphics-designer', 'Motion Graphics Designer', 'مصمم موشن جرافيك'),
    ('role-architectural-visualizer', 'Architectural Visualizer', 'مصمم تصورات معمارية'),
    ('role-game-environment-artist', 'Game Environment Artist', 'فنان بيئات ألعاب'),
    ('role-character-artist', 'Character Artist', 'فنان شخصيات ثلاثية الأبعاد'),
    ('role-vfx-artist', 'VFX Artist', 'فنان مؤثرات بصرية'),
    ('role-product-visualization-artist', 'Product Visualization Artist', 'فنان تصورات المنتجات')
) AS role_seed("id", "name", "nameAr")
CROSS JOIN (
  SELECT "id" FROM "JobCategory" WHERE "name" = '3D Design & Visualization'
) AS category
ON CONFLICT ("categoryId", "name") DO UPDATE
SET "nameAr" = EXCLUDED."nameAr", "updatedAt" = CURRENT_TIMESTAMP;