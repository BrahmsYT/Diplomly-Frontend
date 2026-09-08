/**
 * Ad/soyad sahələri üçün icazə verilən simvol siyahısı (allowlist).
 *
 * Mənbə: CRIT-02 (pentest hesabatı, sentyabr 2026) — `name` və `surname`
 * sahələri ixtiyari HTML/JavaScript qəbul edib saxlayırdı.
 *
 * DİQQƏT: bu YALNIZ interfeys səviyyəsində yoxlamadır. Brauzerin `pattern`
 * atributu təhlükəsizlik nəzarəti deyil — hücumçu sadəcə birbaşa API-yə sorğu
 * göndərib onu keçir. Əsl həll serverdə eyni qaydanın tətbiqidir; buradakı
 * məqsəd real istifadəçiyə serverə getmədən dərhal səhvi göstərməkdir.
 *
 * XSS-ə qarşı frontend-in həqiqi müdafiəsi iki yerdədir:
 *   1) React JSX interpolyasiyası mətn məzmununu avtomatik HTML-kodlaşdırır
 *      (kodda `dangerouslySetInnerHTML` istifadə olunmur — yoxlanılıb).
 *   2) vercel.json-dakı Content-Security-Policy (MED-01) icra olunan
 *      skriptləri və şəbəkə ünvanlarını məhdudlaşdırır.
 *
 * İcazə verilir: istənilən dilin hərfləri (\p{L}) və diakritik işarələri
 * (\p{M}) — ə, ğ, ı, ö, ş, ü, ç daxil — boşluq, apostrof, defis, nöqtə.
 * Rədd edilir: < > & " və digər HTML üçün mənalı simvollar.
 */
export const NAME_PATTERN = "[\\p{L}\\p{M} '\\-.]{1,100}";

export const NAME_TITLE =
  'Yalnız hərflər, boşluq, apostrof, defis və nöqtə istifadə oluna bilər.';
