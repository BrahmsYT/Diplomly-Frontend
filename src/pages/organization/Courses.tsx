import { useEffect, useState } from 'react';
import { Alert, EmptyState, PageHeader, PageLoader, Spinner } from '../../components/ui';
import { ApiError, orgApi } from '../../lib/api';
import type { Course } from '../../types';

/**
 * Bölmə 4.5 — kurs kataloqu.
 * Sertifikat verilərkən kurs adı bu siyahıdan seçilir ki, eyni kursun
 * adı fərqli yazılışlarla bazaya düşməsin.
 */
export function Courses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  useEffect(() => {
    orgApi
      .courses()
      .then(setCourses)
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    const name = newName.trim();
    if (!name) return;

    setBusy('create');
    setError(null);
    try {
      const course = await orgApi.createCourse(name);
      setCourses((prev) => [...prev, course].sort((a, b) => a.name.localeCompare(b.name, 'az')));
      setNewName('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Kurs əlavə edilə bilmədi');
    } finally {
      setBusy(null);
    }
  };

  const handleUpdate = async (id: string) => {
    const name = editingName.trim();
    if (!name) return;

    setBusy(id);
    setError(null);
    try {
      const updated = await orgApi.updateCourse(id, name);
      setCourses((prev) =>
        prev
          .map((course) => (course.id === id ? { ...course, name: updated.name } : course))
          .sort((a, b) => a.name.localeCompare(b.name, 'az')),
      );
      setEditingId(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Kurs yenilənə bilmədi');
    } finally {
      setBusy(null);
    }
  };

  const handleDelete = async (course: Course) => {
    setBusy(course.id);
    setError(null);
    try {
      await orgApi.deleteCourse(course.id);
      setCourses((prev) => prev.filter((item) => item.id !== course.id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Kurs silinə bilmədi');
    } finally {
      setBusy(null);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <>
      <PageHeader
        title="Kurslar"
        description="Sertifikat verərkən kurs adı bu siyahıdan seçilir."
      />

      {error && (
        <div className="mb-4">
          <Alert>{error}</Alert>
        </div>
      )}

      <form onSubmit={handleCreate} className="card mb-6 p-5">
        <label htmlFor="new-course" className="label">
          Yeni kurs əlavə et
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id="new-course"
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            className="input flex-1"
            placeholder="Project Management Fundamentals"
            maxLength={160}
          />
          <button type="submit" className="btn-primary shrink-0" disabled={busy === 'create'}>
            {busy === 'create' && <Spinner className="h-4 w-4" />}
            Əlavə et
          </button>
        </div>
      </form>

      {courses.length === 0 ? (
        <EmptyState
          icon="📚"
          title="Kurs kataloqu boşdur"
          description="Kurs əlavə edin — sertifikat yaradarkən onu siyahıdan seçəcəksiniz. Yeni sertifikatda yazdığınız kurs da avtomatik bura düşür."
        />
      ) : (
        <div className="card divide-y divide-slate-100">
          {courses.map((course) => (
            <div key={course.id} className="flex items-center gap-4 px-5 py-4">
              {editingId === course.id ? (
                <>
                  <input
                    value={editingName}
                    onChange={(event) => setEditingName(event.target.value)}
                    className="input flex-1"
                    autoFocus
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') void handleUpdate(course.id);
                      if (event.key === 'Escape') setEditingId(null);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleUpdate(course.id)}
                    className="btn-primary shrink-0"
                    disabled={busy === course.id}
                  >
                    Yadda saxla
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="btn-secondary shrink-0"
                  >
                    İmtina
                  </button>
                </>
              ) : (
                <>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-slate-900">{course.name}</p>
                    <p className="text-xs text-slate-500">
                      {course.certificateCount} sertifikat verilib
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(course.id);
                      setEditingName(course.name);
                    }}
                    className="shrink-0 text-sm font-medium text-slate-500 hover:text-slate-700"
                  >
                    Dəyiş
                  </button>

                  {course.certificateCount === 0 && (
                    <button
                      type="button"
                      onClick={() => handleDelete(course)}
                      className="shrink-0 text-sm font-medium text-red-500 hover:text-red-700"
                      disabled={busy === course.id}
                    >
                      Sil
                    </button>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="mt-4 text-xs text-slate-500">
        Sertifikat verilmiş kurs silinə bilməz — bu, verilmiş sənədlərin tarixçəsini qorumaq
        üçündür.
      </p>
    </>
  );
}
