import { Question } from './types';

// Mock Soru Bankası - 20 Soru
export const questions: Question[] = [
  {
    id: '1',
    text: "Dünyanın en uzun nehri ___ Nehri'dir.",
    correctAnswer: 'Nil',
  },
  {
    id: '2',
    text: 'Türkiye Cumhuriyeti ___ yılında kurulmuştur.',
    correctAnswer: '1923',
  },
  {
    id: '3',
    text: "İstanbul'un ___ semtinde Kız Kulesi bulunur.",
    correctAnswer: 'Üsküdar',
  },
  {
    id: '4',
    text: 'Güneş sisteminde ___ tane gezegen vardır.',
    correctAnswer: '8',
  },
  {
    id: '5',
    text: 'Mona Lisa tablosunu ___ çizmiştir.',
    correctAnswer: 'Da Vinci',
  },
  {
    id: '6',
    text: "Türkiye'nin başkenti ___ şehridir.",
    correctAnswer: 'Ankara',
  },
  {
    id: '7',
    text: 'Bir yılda ___ ay vardır.',
    correctAnswer: '12',
  },
  {
    id: '8',
    text: "İnsanın vücudunda ___ kemik bulunur.",
    correctAnswer: '206',
  },
  {
    id: '9',
    text: 'Müzikte do-re-mi-fa-sol-la-___ notaları vardır.',
    correctAnswer: 'si',
  },
  {
    id: '10',
    text: "Dünya'nın uydusu ___'dır.",
    correctAnswer: 'Ay',
  },
  {
    id: '11',
    text: 'Bir günde ___ saat vardır.',
    correctAnswer: '24',
  },
  {
    id: '12',
    text: "Fransa'nın başkenti ___ şehridir.",
    correctAnswer: 'Paris',
  },
  {
    id: '13',
    text: 'Olimpiyat Oyunları ___ yılda bir yapılır.',
    correctAnswer: '4',
  },
  {
    id: '14',
    text: "Türkiye'nin en yüksek dağı ___ Dağı'dır.",
    correctAnswer: 'Ağrı',
  },
  {
    id: '15',
    text: 'Bir üçgenin ___ kenarı vardır.',
    correctAnswer: '3',
  },
  {
    id: '16',
    text: "Romeo ve Juliet'i ___ yazmıştır.",
    correctAnswer: 'Shakespeare',
  },
  {
    id: '17',
    text: 'Suyun kimyasal formülü ___\'dir.',
    correctAnswer: 'H2O',
  },
  {
    id: '18',
    text: 'İtalya haritada ___ şeklindedir.',
    correctAnswer: 'çizme',
  },
  {
    id: '19',
    text: "Bir futbol takımında ___ oyuncu sahada bulunur.",
    correctAnswer: '11',
  },
  {
    id: '20',
    text: 'Piramitler ___ ülkesinde bulunur.',
    correctAnswer: 'Mısır',
  },
];

// Rastgele soru seçme fonksiyonu
export function getRandomQuestion(excludeIds: string[] = []): Question | null {
  const availableQuestions = questions.filter(q => !excludeIds.includes(q.id));
  
  if (availableQuestions.length === 0) {
    return null;
  }
  
  const randomIndex = Math.floor(Math.random() * availableQuestions.length);
  return availableQuestions[randomIndex];
}

// Belirli sayıda rastgele soru seç
export function getRandomQuestions(count: number, excludeIds: string[] = []): Question[] {
  const availableQuestions = questions.filter(q => !excludeIds.includes(q.id));
  const shuffled = [...availableQuestions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}
