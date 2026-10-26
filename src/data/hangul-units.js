// A part: Hangul. Letters, sounds and the first words.
// Russian notes compare with Russian sounds only where it truly helps; after
// the first introduction the child learns from sound and Hangul, not Cyrillic.

export const unitA1 = {
  id: "A1",
  part: "A",
  title: { ko: "기본 모음", ru: "Главные гласные" },
  icon: "Smile",
  goal: { ru: "Узнаём 6 гласных: ㅏ ㅓ ㅗ ㅜ ㅡ ㅣ", ko: "모음 6개를 배워요" },
  steps: [
    {
      type: "intro",
      title: { ru: "Корейские буквы — как конструктор", ko: "한글은 블록 놀이" },
      blocks: [
        { ru: "Корейский алфавит называется 한글 (хангыль). Буквы складываются в квадратик-слог: 가, 나, 다.", ko: "한글은 글자를 모아서 네모 한 칸을 만들어요." },
        { ru: "Сегодня — 6 гласных. Перед гласной пишем кружок ㅇ. В начале слога он не читается: 아 = просто «а».", ko: "모음 앞의 ㅇ은 소리가 없어요." },
        { ru: "Смотри на рот: у ㅗ и ㅜ губы кругленькие, у ㅓ и ㅡ — нет.", ko: "입 모양을 잘 보세요." },
      ],
      show: ["아", "어", "오", "우", "으", "이"],
    },
    {
      type: "learn",
      jamo: true,
      items: [
        { ko: "아", glyph: "ㅏ", ru: "Как русское «а». Рот широко открыт.", mouth: "open" },
        { ko: "어", glyph: "ㅓ", ru: "Похоже на «о», но губы НЕ круглые, рот открыт свободно.", mouth: "open-flat" },
        { ko: "오", glyph: "ㅗ", ru: "Как «о». Губы круглые и вытянуты вперёд.", mouth: "round" },
        { ko: "우", glyph: "ㅜ", ru: "Как «у». Губы маленьким кружком.", mouth: "round-small" },
        { ko: "으", glyph: "ㅡ", ru: "Почти как «ы». Губы растянуты в улыбку.", mouth: "smile" },
        { ko: "이", glyph: "ㅣ", ru: "Как «и». Улыбаемся.", mouth: "smile" },
      ],
    },
    {
      type: "listen",
      title: { ru: "Это 어 или 오?", ko: "어예요? 오예요?" },
      note: { ru: "Для русского уха они похожи. Слушай губы: у 오 они круглые.", ko: "" },
      q: [
        { say: "어", options: ["어", "오"] },
        { say: "오", options: ["어", "오"] },
        { say: "오", options: ["어", "오"] },
        { say: "어", options: ["어", "오"] },
        { say: "으", options: ["으", "우"] },
        { say: "우", options: ["으", "우"] },
        { say: "으", options: ["으", "우"] },
        { say: "어", options: ["어", "오"] },
      ],
    },
    {
      type: "listen",
      title: { ru: "Послушай и выбери", ko: "듣고 고르세요" },
      q: [
        { say: "아", options: ["아", "어", "이"] },
        { say: "이", options: ["으", "이", "우"] },
        { say: "우", options: ["오", "우", "어"] },
        { say: "아이", options: ["아이", "오이", "아우"] },
        { say: "오이", options: ["어이", "오이", "아이"] },
      ],
    },
    {
      type: "learn",
      title: { ru: "Первые слова", ko: "첫 낱말" },
      items: [
        { ko: "아이", ru: "ребёнок", icon: "Baby" },
        { ko: "오이", ru: "огурец", icon: "Carrot" },
        { ko: "이", ru: "зуб; два", icon: "Smile" },
      ],
    },
    { type: "speak", items: [{ ko: "아" }, { ko: "어" }, { ko: "오" }, { ko: "우" }, { ko: "으" }, { ko: "이" }, { ko: "아이", ru: "ребёнок" }, { ko: "오이", ru: "огурец" }] },
    { type: "trace", jamo: ["ㅏ", "ㅓ", "ㅗ", "ㅜ", "ㅡ", "ㅣ"] },
  ],
  words: [
    { ko: "아이", ru: "ребёнок", icon: "Baby" },
    { ko: "오이", ru: "огурец", icon: "Carrot" },
  ],
};

export const unitA2 = {
  id: "A2",
  part: "A",
  title: { ko: "자음 1", ru: "Согласные 1" },
  icon: "Blocks",
  goal: { ru: "ㄱ ㄴ ㄷ ㄹ ㅁ и первые слоги: 가, 나, 다…", ko: "자음 5개로 글자를 만들어요" },
  steps: [
    {
      type: "intro",
      title: { ru: "Согласная + гласная = слог", ko: "자음 + 모음 = 글자" },
      blocks: [
        { ru: "Вместо кружка ㅇ ставим согласную: ㄱ + ㅏ = 가.", ko: "ㄱ과 ㅏ를 모으면 가가 돼요." },
        { ru: "Форма букв показывает рот. ㄱ — язык поднимается к нёбу. ㄴ — кончик языка касается зубов. ㅁ — закрытые губы, квадратик.", ko: "자음 모양은 입과 혀의 모양이에요." },
        { ru: "ㄹ в начале и между гласными — короткое «р» (один удар языком). В конце слога — «л».", ko: "ㄹ은 '라'일 때와 '알'일 때 소리가 달라요." },
      ],
      show: ["가", "나", "다", "라", "마"],
    },
    {
      type: "learn",
      jamo: true,
      items: [
        { ko: "가", glyph: "ㄱ", ru: "Между «к» и «г». Мягко, без нажима." },
        { ko: "나", glyph: "ㄴ", ru: "Как «н»." },
        { ko: "다", glyph: "ㄷ", ru: "Между «т» и «д». Мягко." },
        { ko: "라", glyph: "ㄹ", ru: "Короткое «р», один удар языком." },
        { ko: "마", glyph: "ㅁ", ru: "Как «м»." },
      ],
    },
    {
      type: "build",
      title: { ru: "Собери слог, который слышишь", ko: "듣고 글자를 만들어요" },
      cho: ["ㄱ", "ㄴ", "ㄷ", "ㄹ", "ㅁ"],
      jung: ["ㅏ", "ㅓ", "ㅗ", "ㅜ", "ㅣ"],
      q: ["나", "고", "더", "루", "미", "가"],
    },
    {
      type: "listen",
      title: { ru: "Послушай и выбери", ko: "듣고 고르세요" },
      q: [
        { say: "나무", options: ["나무", "너무", "나모"] },
        { say: "다리", options: ["도리", "다리", "타리"] },
        { say: "머리", options: ["머리", "모리", "마리"] },
        { say: "고기", options: ["거기", "고기", "구기"] },
        { say: "오리", options: ["우리", "어리", "오리"] },
      ],
    },
    {
      type: "learn",
      title: { ru: "Новые слова", ko: "새 낱말" },
      items: [
        { ko: "나무", ru: "дерево", icon: "TreePine" },
        { ko: "다리", ru: "нога; мост", icon: "Footprints" },
        { ko: "머리", ru: "голова", icon: "Brain" },
        { ko: "고기", ru: "мясо", icon: "Ham" },
        { ko: "오리", ru: "утка", icon: "Bird" },
        { ko: "우리", ru: "мы", icon: "Users" },
      ],
    },
    { type: "speak", items: [{ ko: "가" }, { ko: "나" }, { ko: "다" }, { ko: "라" }, { ko: "마" }, { ko: "나무", ru: "дерево" }, { ko: "다리", ru: "нога; мост" }, { ko: "머리", ru: "голова" }, { ko: "우리", ru: "мы" }] },
    {
      type: "read",
      title: { ru: "Прочитай и найди значение", ko: "읽고 뜻을 고르세요" },
      q: [
        { ko: "나무", options: ["дерево", "мясо", "утка"], answer: 0 },
        { ko: "머리", options: ["нога", "голова", "мы"], answer: 1 },
        { ko: "우리", options: ["мы", "утка", "дерево"], answer: 0 },
        { ko: "고기", options: ["голова", "дерево", "мясо"], answer: 2 },
      ],
    },
    { type: "trace", jamo: ["ㄱ", "ㄴ", "ㄷ", "ㄹ", "ㅁ"] },
  ],
  words: [
    { ko: "나무", ru: "дерево", icon: "TreePine" },
    { ko: "다리", ru: "нога; мост", icon: "Footprints" },
    { ko: "머리", ru: "голова", icon: "Brain" },
    { ko: "고기", ru: "мясо", icon: "Ham" },
    { ko: "오리", ru: "утка", icon: "Bird" },
    { ko: "우리", ru: "мы", icon: "Users" },
  ],
};

export const unitA3 = {
  id: "A3",
  part: "A",
  title: { ko: "자음 2", ru: "Согласные 2" },
  icon: "Blocks",
  goal: { ru: "ㅂ ㅅ ㅇ ㅈ ㅎ и слова «мама», «папа»", ko: "자음 5개를 더 배워요" },
  steps: [
    {
      type: "intro",
      title: { ru: "Ещё 5 согласных", ko: "자음 다섯 개 더" },
      blocks: [
        { ru: "ㅂ — между «п» и «б». ㅈ — мягкое «дж». ㅎ — лёгкий выдох, как «х», только тише.", ko: "" },
        { ru: "ㅅ — как «с». Перед ㅣ звучит мягко, почти «щи»: 시.", ko: "ㅅ은 ㅣ 앞에서 소리가 부드러워져요." },
        { ru: "ㅇ ты уже знаешь: в начале слога он молчит.", ko: "ㅇ은 앞에서 소리가 없어요." },
      ],
      show: ["바", "사", "아", "자", "하"],
    },
    {
      type: "learn",
      jamo: true,
      items: [
        { ko: "바", glyph: "ㅂ", ru: "Между «п» и «б»." },
        { ko: "사", glyph: "ㅅ", ru: "Как «с»." },
        { ko: "아", glyph: "ㅇ", ru: "В начале слога молчит." },
        { ko: "자", glyph: "ㅈ", ru: "Мягкое «дж»." },
        { ko: "하", glyph: "ㅎ", ru: "Лёгкий выдох «х»." },
      ],
    },
    {
      type: "build",
      title: { ru: "Собери слог, который слышишь", ko: "듣고 글자를 만들어요" },
      cho: ["ㅂ", "ㅅ", "ㅇ", "ㅈ", "ㅎ", "ㅁ"],
      jung: ["ㅏ", "ㅓ", "ㅗ", "ㅜ", "ㅣ"],
      q: ["바", "소", "지", "허", "무", "사"],
    },
    {
      type: "learn",
      title: { ru: "Новые слова", ko: "새 낱말" },
      items: [
        { ko: "어머니", ru: "мама", icon: "Heart" },
        { ko: "아버지", ru: "папа", icon: "User" },
        { ko: "하나", ru: "один", icon: "Hash" },
        { ko: "모자", ru: "шапка", icon: "GraduationCap" },
        { ko: "바지", ru: "брюки", icon: "Shirt" },
        { ko: "비", ru: "дождь", icon: "CloudRain" },
      ],
    },
    {
      type: "listen",
      title: { ru: "Послушай и выбери картинку", ko: "듣고 그림을 고르세요" },
      pictures: true,
      q: [
        { say: "비", options: [{ ko: "비", icon: "CloudRain" }, { ko: "모자", icon: "GraduationCap" }, { ko: "나무", icon: "TreePine" }] },
        { say: "바지", options: [{ ko: "머리", icon: "Brain" }, { ko: "바지", icon: "Shirt" }, { ko: "오리", icon: "Bird" }] },
        { say: "어머니", options: [{ ko: "아버지", icon: "User" }, { ko: "하나", icon: "Hash" }, { ko: "어머니", icon: "Heart" }] },
        { say: "모자", options: [{ ko: "모자", icon: "GraduationCap" }, { ko: "비", icon: "CloudRain" }, { ko: "바지", icon: "Shirt" }] },
      ],
    },
    { type: "speak", items: [{ ko: "바" }, { ko: "사" }, { ko: "자" }, { ko: "하" }, { ko: "어머니", ru: "мама" }, { ko: "아버지", ru: "папа" }, { ko: "하나", ru: "один" }] },
    {
      type: "read",
      title: { ru: "Прочитай и найди значение", ko: "읽고 뜻을 고르세요" },
      q: [
        { ko: "아버지", options: ["мама", "папа", "шапка"], answer: 1 },
        { ko: "하나", options: ["один", "дождь", "брюки"], answer: 0 },
        { ko: "어머니", options: ["папа", "один", "мама"], answer: 2 },
      ],
    },
    { type: "trace", jamo: ["ㅂ", "ㅅ", "ㅇ", "ㅈ", "ㅎ"] },
  ],
  words: [
    { ko: "어머니", ru: "мама", icon: "Heart" },
    { ko: "아버지", ru: "папа", icon: "User" },
    { ko: "하나", ru: "один", icon: "Hash" },
    { ko: "모자", ru: "шапка", icon: "GraduationCap" },
    { ko: "바지", ru: "брюки", icon: "Shirt" },
    { ko: "비", ru: "дождь", icon: "CloudRain" },
  ],
};

export const unitA4 = {
  id: "A4",
  part: "A",
  title: { ko: "모음 2", ru: "Гласные 2" },
  icon: "Smile",
  goal: { ru: "ㅑ ㅕ ㅛ ㅠ ㅐ ㅔ: гласные с «й»", ko: "모음 6개를 더 배워요" },
  steps: [
    {
      type: "intro",
      title: { ru: "Вторая чёрточка = «й»", ko: "선이 하나 더 있으면 '이' 소리가 붙어요" },
      blocks: [
        { ru: "Добавь вторую чёрточку — и к звуку прибавится «й»: ㅏ «а» → ㅑ «я», ㅜ «у» → ㅠ «ю».", ko: "" },
        { ru: "ㅛ — как «ё» с круглыми губами. ㅕ — «й» + ㅓ, губы не круглые.", ko: "" },
        { ru: "ㅐ и ㅔ сегодня звучат почти одинаково, как «э». Различаем их в написании.", ko: "ㅐ와 ㅔ는 소리가 거의 같아요." },
      ],
      show: ["야", "여", "요", "유", "애", "에"],
    },
    {
      type: "learn",
      jamo: true,
      items: [
        { ko: "야", glyph: "ㅑ", ru: "Как «я»." },
        { ko: "여", glyph: "ㅕ", ru: "«й» + ㅓ. Губы не круглые." },
        { ko: "요", glyph: "ㅛ", ru: "Как «ё», губы круглые." },
        { ko: "유", glyph: "ㅠ", ru: "Как «ю»." },
        { ko: "애", glyph: "ㅐ", ru: "Как «э»." },
        { ko: "에", glyph: "ㅔ", ru: "Тоже «э»." },
      ],
    },
    {
      type: "listen",
      title: { ru: "Это 여 или 요?", ko: "여예요? 요예요?" },
      q: [
        { say: "여", options: ["여", "요"] },
        { say: "요", options: ["여", "요"] },
        { say: "유", options: ["요", "유"] },
        { say: "야", options: ["야", "여"] },
        { say: "요", options: ["여", "요"] },
        { say: "여", options: ["여", "요"] },
      ],
    },
    {
      type: "learn",
      title: { ru: "Новые слова", ko: "새 낱말" },
      items: [
        { ko: "우유", ru: "молоко", icon: "Milk" },
        { ko: "여우", ru: "лиса", icon: "Squirrel" },
        { ko: "개", ru: "собака", icon: "Dog" },
        { ko: "노래", ru: "песня", icon: "Music" },
        { ko: "네", ru: "да", icon: "Check" },
        { ko: "아니요", ru: "нет", icon: "X" },
      ],
    },
    {
      type: "listen",
      title: { ru: "Послушай и выбери картинку", ko: "듣고 그림을 고르세요" },
      pictures: true,
      q: [
        { say: "우유", options: [{ ko: "우유", icon: "Milk" }, { ko: "개", icon: "Dog" }, { ko: "노래", icon: "Music" }] },
        { say: "개", options: [{ ko: "여우", icon: "Squirrel" }, { ko: "개", icon: "Dog" }, { ko: "우유", icon: "Milk" }] },
        { say: "노래", options: [{ ko: "네", icon: "Check" }, { ko: "아니요", icon: "X" }, { ko: "노래", icon: "Music" }] },
        { say: "아니요", options: [{ ko: "네", icon: "Check" }, { ko: "아니요", icon: "X" }, { ko: "개", icon: "Dog" }] },
      ],
    },
    { type: "speak", items: [{ ko: "야" }, { ko: "여" }, { ko: "요" }, { ko: "유" }, { ko: "우유", ru: "молоко" }, { ko: "네", ru: "да" }, { ko: "아니요", ru: "нет" }] },
    { type: "trace", jamo: ["ㅑ", "ㅕ", "ㅛ", "ㅠ", "ㅐ", "ㅔ"] },
  ],
  words: [
    { ko: "우유", ru: "молоко", icon: "Milk" },
    { ko: "여우", ru: "лиса", icon: "Squirrel" },
    { ko: "개", ru: "собака", icon: "Dog" },
    { ko: "노래", ru: "песня", icon: "Music" },
    { ko: "네", ru: "да", icon: "Check" },
    { ko: "아니요", ru: "нет", icon: "X" },
  ],
};

export const unitA5 = {
  id: "A5",
  part: "A",
  title: { ko: "세 가지 소리", ru: "Три похожих звука" },
  icon: "Wind",
  goal: { ru: "Различаем 가 · 카 · 까 — самое трудное для русского уха", ko: "가·카·까를 구별해요" },
  steps: [
    {
      type: "intro",
      title: { ru: "Три «к»: обычный, с ветром и твёрдый", ko: "보통 소리, 바람 소리, 힘준 소리" },
      blocks: [
        { ru: "В русском «г» и «к» различаются голосом. В корейском — воздухом и силой.", ko: "한국어는 바람과 힘으로 소리를 나눠요." },
        { ru: "ㄱ — обычный, мягкий. ㅋ — с сильным выдохом: держи бумажку у рта, она шевелится. ㄲ — твёрдо, без воздуха.", ko: "입 앞에 종이를 대 보세요. ㅋ에서만 종이가 움직여요." },
        { ru: "Секрет: русское «к» в слове «кот» ближе всего к ㄲ. Так же т → ㄸ, п → ㅃ.", ko: "" },
        { ru: "Так же устроены ㄷ ㅌ ㄸ, ㅂ ㅍ ㅃ, ㅈ ㅊ ㅉ. У ㅅ только два: ㅅ и ㅆ.", ko: "" },
      ],
      show: ["가", "카", "까", "다", "타", "따", "바", "파", "빠"],
    },
    {
      type: "learn",
      jamo: true,
      items: [
        { ko: "카", glyph: "ㅋ", ru: "«к» с сильным выдохом." },
        { ko: "까", glyph: "ㄲ", ru: "Твёрдое «к» без воздуха." },
        { ko: "타", glyph: "ㅌ", ru: "«т» с выдохом." },
        { ko: "따", glyph: "ㄸ", ru: "Твёрдое «т»." },
        { ko: "파", glyph: "ㅍ", ru: "«п» с выдохом." },
        { ko: "빠", glyph: "ㅃ", ru: "Твёрдое «п»." },
        { ko: "차", glyph: "ㅊ", ru: "«ч» с выдохом." },
        { ko: "짜", glyph: "ㅉ", ru: "Твёрдое «ч»." },
        { ko: "싸", glyph: "ㅆ", ru: "Твёрдое, напряжённое «с»." },
      ],
    },
    {
      type: "listen",
      title: { ru: "Какой из трёх?", ko: "어떤 소리예요?" },
      note: { ru: "Не спеши. Можно слушать сколько угодно раз.", ko: "" },
      q: [
        { say: "카", options: ["가", "카", "까"] },
        { say: "까", options: ["가", "카", "까"] },
        { say: "가", options: ["가", "카", "까"] },
        { say: "타", options: ["다", "타", "따"] },
        { say: "따", options: ["다", "타", "따"] },
        { say: "파", options: ["바", "파", "빠"] },
        { say: "빠", options: ["바", "파", "빠"] },
        { say: "차", options: ["자", "차", "짜"] },
        { say: "짜", options: ["자", "차", "짜"] },
        { say: "싸", options: ["사", "싸"] },
      ],
    },
    {
      type: "learn",
      title: { ru: "Слова с этими звуками", ko: "낱말" },
      items: [
        { ko: "코", ru: "нос", icon: "Smile" },
        { ko: "토끼", ru: "кролик", icon: "Rabbit" },
        { ko: "포도", ru: "виноград", icon: "Grape" },
        { ko: "아빠", ru: "папа (дома)", icon: "User" },
        { ko: "차", ru: "машина; чай", icon: "Car" },
        { ko: "싸요", ru: "дёшево", icon: "Coins" },
      ],
    },
    {
      type: "read",
      title: { ru: "Как правильно написать?", ko: "맞게 쓴 것을 고르세요" },
      sayFirst: true,
      q: [
        { ko: "코", ru: "нос", options: ["고", "코", "꼬"], answer: 1, spelling: true },
        { ko: "토끼", ru: "кролик", options: ["도끼", "토끼", "토기"], answer: 1, spelling: true },
        { ko: "아빠", ru: "папа", options: ["아바", "아파", "아빠"], answer: 2, spelling: true },
        { ko: "포도", ru: "виноград", options: ["포도", "보도", "뽀도"], answer: 0, spelling: true },
      ],
    },
    { type: "speak", items: [{ ko: "가 카 까" }, { ko: "다 타 따" }, { ko: "바 파 빠" }, { ko: "코", ru: "нос" }, { ko: "토끼", ru: "кролик" }, { ko: "아빠", ru: "папа" }] },
  ],
  words: [
    { ko: "코", ru: "нос", icon: "Smile" },
    { ko: "토끼", ru: "кролик", icon: "Rabbit" },
    { ko: "포도", ru: "виноград", icon: "Grape" },
    { ko: "아빠", ru: "папа", icon: "User" },
    { ko: "차", ru: "машина; чай", icon: "Car" },
    { ko: "싸요", ru: "дёшево", icon: "Coins" },
  ],
};

export const unitA6 = {
  id: "A6",
  part: "A",
  title: { ko: "받침", ru: "Последняя буква слога" },
  icon: "Square",
  goal: { ru: "Буква внизу слога: 책, 물, 방", ko: "받침을 배워요" },
  steps: [
    {
      type: "intro",
      title: { ru: "Буква снизу — 받침 (патчим)", ko: "아래에 오는 자음, 받침" },
      blocks: [
        { ru: "Иногда согласная стоит внизу слога: 바 + ㅇ = 방. Это 받침.", ko: "글자 아래에 자음이 오면 받침이에요." },
        { ru: "Главное правило: в конце звук не «выпускаем». Рот закрывается — и всё. В 밥 губы просто смыкаются, без «п» в конце.", ko: "받침 소리는 터뜨리지 않고 멈춰요." },
        { ru: "Хватит 7 звуков: ㄱ ㄴ ㄷ ㄹ ㅁ ㅂ ㅇ. ㅇ внизу звучит как «нг».", ko: "받침 소리는 7개예요." },
      ],
      show: ["박", "반", "받", "발", "밤", "밥", "방"],
    },
    {
      type: "listen",
      title: { ru: "Какой патчим?", ko: "어떤 받침이에요?" },
      q: [
        { say: "방", options: ["반", "방", "밤"] },
        { say: "밤", options: ["밥", "방", "밤"] },
        { say: "발", options: ["발", "반", "박"] },
        { say: "반", options: ["방", "반", "발"] },
        { say: "박", options: ["밥", "박", "받"] },
        { say: "밥", options: ["밤", "밥", "박"] },
      ],
    },
    {
      type: "build",
      title: { ru: "Добавь патчим", ko: "받침을 붙여요" },
      cho: ["ㅂ", "ㅁ", "ㄱ", "ㅅ"],
      jung: ["ㅏ", "ㅜ", "ㅓ", "ㅗ"],
      jong: ["", "ㄱ", "ㄴ", "ㄹ", "ㅁ", "ㅇ"],
      q: ["방", "물", "산", "곰", "벌", "국"],
    },
    {
      type: "learn",
      title: { ru: "Новые слова", ko: "새 낱말" },
      items: [
        { ko: "책", ru: "книга", icon: "BookOpen" },
        { ko: "물", ru: "вода", icon: "GlassWater" },
        { ko: "밥", ru: "рис; еда", icon: "Soup" },
        { ko: "방", ru: "комната", icon: "House" },
        { ko: "공", ru: "мяч", icon: "Volleyball" },
        { ko: "산", ru: "гора", icon: "Mountain" },
      ],
    },
    {
      type: "listen",
      title: { ru: "Послушай и выбери картинку", ko: "듣고 그림을 고르세요" },
      pictures: true,
      q: [
        { say: "물", options: [{ ko: "물", icon: "GlassWater" }, { ko: "산", icon: "Mountain" }, { ko: "책", icon: "BookOpen" }] },
        { say: "공", options: [{ ko: "방", icon: "House" }, { ko: "공", icon: "Volleyball" }, { ko: "밥", icon: "Soup" }] },
        { say: "책", options: [{ ko: "밥", icon: "Soup" }, { ko: "물", icon: "GlassWater" }, { ko: "책", icon: "BookOpen" }] },
        { say: "산", options: [{ ko: "산", icon: "Mountain" }, { ko: "공", icon: "Volleyball" }, { ko: "방", icon: "House" }] },
      ],
    },
    { type: "speak", items: [{ ko: "책", ru: "книга" }, { ko: "물", ru: "вода" }, { ko: "밥", ru: "рис; еда" }, { ko: "방", ru: "комната" }, { ko: "물 주세요", ru: "Дайте воды, пожалуйста" }] },
  ],
  words: [
    { ko: "책", ru: "книга", icon: "BookOpen" },
    { ko: "물", ru: "вода", icon: "GlassWater" },
    { ko: "밥", ru: "рис; еда", icon: "Soup" },
    { ko: "방", ru: "комната", icon: "House" },
    { ko: "공", ru: "мяч", icon: "Volleyball" },
    { ko: "산", ru: "гора", icon: "Mountain" },
  ],
};
