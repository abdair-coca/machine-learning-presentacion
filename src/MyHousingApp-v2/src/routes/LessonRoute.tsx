import { useParams, Navigate } from 'react-router-dom';
import { getLesson } from '../lessons';
import { Lesson } from '../components/lesson/Lesson';

export function LessonRoute() {
  const { slug } = useParams<{ slug: string }>();
  const lesson = slug ? getLesson(slug) : undefined;
  if (!lesson) return <Navigate to="/" replace />;
  return <Lesson spec={lesson} />;
}
