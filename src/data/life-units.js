// B part: everyday Korean for surviving the school day, and C part: the
// words that classroom tasks are made of. Topic order follows the national
// KSL textbook (나 → 내 물건 → 우리 학교 → 학교생활); every sentence is new.

export const unitB1 = {
  id: "B1",
  part: "B",
  title: { ko: "나", ru: "Это я" },
  icon: "Hand",
  goal: { ru: "Здороваемся и рассказываем о себе", ko: "인사하고 나를 소개해요" },
  steps: [
    {
      type: "scene",
      title: { ru: "Первый день в школе", ko: "학교에 간 첫날" },
      note: { ru: "Алина пришла в новый класс. Послушай, как она знакомится.", ko: "" },
      lines: [
        { who: "teacher", ko: "안녕하세요? 이름이 뭐예요?", ru: "Здравствуй! Как тебя зовут?" },
        { who: "kid", ko: "안녕하세요. 저는 알리나예요.", ru: "Здравствуйте. Меня зовут Алина." },
        { who: "teacher", ko: "어느 나라에서 왔어요?", ru: "Из какой ты страны?" },
        { who: "kid", ko: "카자흐스탄에서 왔어요.", ru: "Я из Казахстана." },
        { who: "friend", ko: "안녕! 나는 민준이야. 반가워!", ru: "Привет! Я Минджун. Рад познакомиться!" },
      ],
    },
    {
      type: "learn",
      items: [
        { ko: "안녕하세요", ru: "Здравствуйте (взрослым)", icon: "Hand" },
        { ko: "안녕", ru: "Привет (друзьям)", icon: "Smile" },
        { ko: "저는 알리나예요", ru: "Меня зовут Алина", icon: "User" },
        { ko: "이름", ru: "имя", icon: "IdCard" },
        { ko: "카자흐스탄에서 왔어요", ru: "Я из Казахстана", icon: "Flag" },
        { ko: "우즈베키스탄에서 왔어요", ru: "Я из Узбекистана", icon: "Flag" },
        { ko: "반가워요", ru: "Рад(а) познакомиться", icon: "HeartHandshake" },
        { ko: "감사합니다", ru: "Спасибо", icon: "Heart" },
      ],
    },
    {
      type: "choose",
      title: { ru: "Что сказать?", ko: "뭐라고 말해요?" },
      note: { ru: "Взрослым — вежливо: 안녕하세요. Друзьям можно просто 안녕.", ko: "" },
      q: [
        { prompt: { ru: "Ты входишь в класс. Там учитель.", icon: "School" }, options: ["안녕하세요", "안녕"], answer: 0 },
        { prompt: { ru: "Ты встретил одноклассника.", icon: "Users" }, options: ["안녕하세요", "안녕"], answer: 1 },
        { prompt: { ru: "Учитель помог тебе.", icon: "HeartHandshake" }, options: ["반가워요", "감사합니다"], answer: 1 },
        { prompt: { ru: "Тебя спросили: «이름이 뭐예요?»", icon: "IdCard" }, options: ["저는 알리나예요", "카자흐스탄에서 왔어요"], answer: 0 },
      ],
    },
    {
      type: "grammar",
      title: { ru: "예요 или 이에요?", ko: "예요? 이에요?" },
      rule: { ru: "Если в конце слова есть патчим — 이에요. Если нет — 예요.", ko: "받침이 있으면 '이에요', 없으면 '예요'." },
      examples: [
        { ko: "알리나예요", ru: "на - нет патчима" },
        { ko: "티무르예요", ru: "르 - нет патчима" },
        { ko: "민준이에요", ru: "준 - есть патчим ㄴ" },
      ],
      q: [
        { word: "티무르", answer: "예요" },
        { word: "민준", answer: "이에요" },
        { word: "마디나", answer: "예요" },
        { word: "선생님", answer: "이에요" },
        { word: "학생", answer: "이에요" },
      ],
      options: ["예요", "이에요"],
    },
    { type: "speak", items: [{ ko: "안녕하세요", ru: "Здравствуйте" }, { ko: "저는 알리나예요", ru: "Меня зовут Алина" }, { ko: "카자흐스탄에서 왔어요", ru: "Я из Казахстана" }, { ko: "우즈베키스탄에서 왔어요", ru: "Я из Узбекистана" }, { ko: "반가워요", ru: "Рад(а) познакомиться" }] },
    { type: "order", items: [{ ko: "저는 알리나예요", ru: "Меня зовут Алина" }, { ko: "우즈베키스탄에서 왔어요", ru: "Я из Узбекистана" }, { ko: "이름이 뭐예요?", ru: "Как тебя зовут?" }] },
  ],
  words: [
    { ko: "안녕하세요", ru: "Здравствуйте", icon: "Hand" },
    { ko: "안녕", ru: "Привет", icon: "Smile" },
    { ko: "이름", ru: "имя", icon: "IdCard" },
    { ko: "반가워요", ru: "Рад(а) познакомиться", icon: "HeartHandshake" },
    { ko: "감사합니다", ru: "Спасибо", icon: "Heart" },
  ],
  faq: [
    {
      keys: ["예요", "이에요"],
      ru: "«예요» и «이에요» значат «это / я есть». Смотри на последний слог: есть патчим (буква снизу) — 이에요: 민준이에요. Нет патчима — 예요: 알리나예요.",
    },
    {
      keys: ["안녕하세요", "안녕", "привет", "здравств"],
      ru: "«안녕하세요» — вежливо, для учителя и взрослых. «안녕» — для друзей. Оба значат «здравствуй» и даже «пока».",
    },
    {
      keys: ["왔어요", "에서 왔"],
      ru: "«에서 왔어요» — «я приехал(а) из…». 카자흐스탄에서 왔어요 = Я из Казахстана. 에서 = «из», 왔어요 = «приехал(а)».",
    },
  ],
};

export const unitB2 = {
  id: "B2",
  part: "B",
  title: { ko: "내 물건", ru: "Мои вещи" },
  icon: "Backpack",
  goal: { ru: "Называем школьные вещи и просим одолжить", ko: "학용품 이름을 말하고 빌려요" },
  steps: [
    {
      type: "scene",
      title: { ru: "На уроке рисования", ko: "미술 시간" },
      note: { ru: "Алина забыла ластик. Послушай, что она говорит Минджуну.", ko: "" },
      lines: [
        { who: "friend", ko: "알리나, 이거 뭐예요?", ru: "Алина, что это?" },
        { who: "kid", ko: "필통이에요.", ru: "Это пенал." },
        { who: "kid", ko: "민준아, 지우개 빌려줄래?", ru: "Минджун, одолжишь ластик?" },
        { who: "friend", ko: "응, 여기!", ru: "Да, держи!" },
        { who: "kid", ko: "고마워!", ru: "Спасибо!" },
      ],
    },
    {
      type: "learn",
      items: [
        { ko: "연필", ru: "карандаш", icon: "Pencil" },
        { ko: "지우개", ru: "ластик", icon: "Eraser" },
        { ko: "공책", ru: "тетрадь", icon: "Notebook" },
        { ko: "책", ru: "книга, учебник", icon: "BookOpen" },
        { ko: "가방", ru: "рюкзак", icon: "Backpack" },
        { ko: "필통", ru: "пенал", icon: "PencilRuler" },
        { ko: "가위", ru: "ножницы", icon: "Scissors" },
        { ko: "자", ru: "линейка", icon: "Ruler" },
      ],
    },
    {
      type: "listen",
      title: { ru: "Послушай и выбери картинку", ko: "듣고 그림을 고르세요" },
      pictures: true,
      q: [
        { say: "지우개", options: [{ ko: "연필", icon: "Pencil" }, { ko: "지우개", icon: "Eraser" }, { ko: "가위", icon: "Scissors" }] },
        { say: "공책", options: [{ ko: "공책", icon: "Notebook" }, { ko: "가방", icon: "Backpack" }, { ko: "자", icon: "Ruler" }] },
        { say: "가위", options: [{ ko: "필통", icon: "PencilRuler" }, { ko: "책", icon: "BookOpen" }, { ko: "가위", icon: "Scissors" }] },
        { say: "가방", options: [{ ko: "가방", icon: "Backpack" }, { ko: "지우개", icon: "Eraser" }, { ko: "공책", icon: "Notebook" }] },
        { say: "자", options: [{ ko: "가위", icon: "Scissors" }, { ko: "자", icon: "Ruler" }, { ko: "연필", icon: "Pencil" }] },
      ],
    },
    {
      type: "grammar",
      title: { ru: "Это что? Это …", ko: "이거 뭐예요? ○○이에요/예요" },
      rule: { ru: "Тот же закон: патчим есть — 이에요 (연필이에요), нет — 예요 (지우개예요).", ko: "받침이 있으면 '이에요', 없으면 '예요'." },
      examples: [
        { ko: "연필이에요", ru: "필 - патчим ㄹ" },
        { ko: "지우개예요", ru: "개 - нет патчима" },
      ],
      q: [
        { word: "공책", answer: "이에요" },
        { word: "가위", answer: "예요" },
        { word: "가방", answer: "이에요" },
        { word: "자", answer: "예요" },
        { word: "필통", answer: "이에요" },
      ],
      options: ["예요", "이에요"],
    },
    { type: "speak", items: [{ ko: "이거 뭐예요?", ru: "Что это?" }, { ko: "연필이에요", ru: "Это карандаш" }, { ko: "지우개 빌려줄래?", ru: "Одолжишь ластик? (другу)" }, { ko: "고마워", ru: "Спасибо (другу)" }] },
    { type: "order", items: [{ ko: "이거 뭐예요?", ru: "Что это?" }, { ko: "지우개 빌려줄래?", ru: "Одолжишь ластик?" }, { ko: "이거 내 가방이에요", ru: "Это мой рюкзак" }] },
  ],
  words: [
    { ko: "연필", ru: "карандаш", icon: "Pencil" },
    { ko: "지우개", ru: "ластик", icon: "Eraser" },
    { ko: "공책", ru: "тетрадь", icon: "Notebook" },
    { ko: "가방", ru: "рюкзак", icon: "Backpack" },
    { ko: "필통", ru: "пенал", icon: "PencilRuler" },
    { ko: "가위", ru: "ножницы", icon: "Scissors" },
    { ko: "자", ru: "линейка", icon: "Ruler" },
  ],
  faq: [
    { keys: ["빌려", "одолж", "можно взять"], ru: "«빌려줄래?» — «одолжишь?» так говорят другу. Учителю вежливее: «빌려 주세요» — «одолжите, пожалуйста»." },
    { keys: ["이거", "저거"], ru: "«이거» — «это» (то, что рядом с тобой). «이거 뭐예요?» — «Что это?»." },
    { keys: ["고마워", "감사", "спасибо"], ru: "«고마워» — спасибо другу. «감사합니다» — спасибо учителю и взрослым." },
  ],
};

export const unitB3 = {
  id: "B3",
  part: "B",
  title: { ko: "우리 학교", ru: "Моя школа" },
  icon: "School",
  goal: { ru: "Находим в школе туалет, столовую и медкабинет", ko: "학교 장소를 찾아요" },
  steps: [
    {
      type: "scene",
      title: { ru: "Где туалет?", ko: "화장실이 어디예요?" },
      note: { ru: "Тимур ищет туалет и спрашивает старшеклассника.", ko: "" },
      lines: [
        { who: "kid", ko: "저기요, 화장실 어디예요?", ru: "Извините, где туалет?" },
        { who: "friend", ko: "저기예요. 교실 옆에 있어요.", ru: "Вон там. Рядом с классом." },
        { who: "kid", ko: "감사합니다!", ru: "Спасибо!" },
      ],
    },
    {
      type: "learn",
      items: [
        { ko: "교실", ru: "класс (комната)", icon: "Presentation" },
        { ko: "화장실", ru: "туалет", icon: "Toilet" },
        { ko: "보건실", ru: "медкабинет", icon: "Stethoscope" },
        { ko: "급식실", ru: "столовая", icon: "Utensils" },
        { ko: "운동장", ru: "школьный двор, стадион", icon: "Volleyball" },
        { ko: "도서관", ru: "библиотека", icon: "Library" },
        { ko: "교무실", ru: "учительская", icon: "Users" },
      ],
    },
    {
      type: "listen",
      title: { ru: "Куда нужно идти?", ko: "어디예요?" },
      pictures: true,
      q: [
        { say: "보건실", options: [{ ko: "보건실", icon: "Stethoscope" }, { ko: "도서관", icon: "Library" }, { ko: "교실", icon: "Presentation" }] },
        { say: "급식실", options: [{ ko: "화장실", icon: "Toilet" }, { ko: "급식실", icon: "Utensils" }, { ko: "운동장", icon: "Volleyball" }] },
        { say: "화장실", options: [{ ko: "교무실", icon: "Users" }, { ko: "보건실", icon: "Stethoscope" }, { ko: "화장실", icon: "Toilet" }] },
        { say: "운동장", options: [{ ko: "운동장", icon: "Volleyball" }, { ko: "급식실", icon: "Utensils" }, { ko: "도서관", icon: "Library" }] },
        { say: "교무실", options: [{ ko: "교실", icon: "Presentation" }, { ko: "교무실", icon: "Users" }, { ko: "화장실", icon: "Toilet" }] },
      ],
    },
    {
      type: "choose",
      title: { ru: "Куда ты пойдёшь?", ko: "어디에 가요?" },
      q: [
        { prompt: { ru: "Хочешь пообедать.", icon: "Soup" }, options: ["급식실", "도서관"], answer: 0 },
        { prompt: { ru: "Упал и поранил колено.", icon: "Bandage" }, options: ["운동장", "보건실"], answer: 1 },
        { prompt: { ru: "Хочешь взять книгу.", icon: "BookOpen" }, options: ["도서관", "화장실"], answer: 0 },
        { prompt: { ru: "Урок физкультуры на улице.", icon: "Volleyball" }, options: ["교무실", "운동장"], answer: 1 },
      ],
    },
    { type: "speak", items: [{ ko: "화장실 어디예요?", ru: "Где туалет?" }, { ko: "보건실 어디예요?", ru: "Где медкабинет?" }, { ko: "저기요", ru: "Извините (чтобы позвать)" }, { ko: "감사합니다", ru: "Спасибо" }] },
    { type: "order", items: [{ ko: "화장실 어디예요?", ru: "Где туалет?" }, { ko: "교실 옆에 있어요", ru: "Рядом с классом" }] },
  ],
  words: [
    { ko: "교실", ru: "класс", icon: "Presentation" },
    { ko: "화장실", ru: "туалет", icon: "Toilet" },
    { ko: "보건실", ru: "медкабинет", icon: "Stethoscope" },
    { ko: "급식실", ru: "столовая", icon: "Utensils" },
    { ko: "운동장", ru: "школьный двор", icon: "Volleyball" },
    { ko: "도서관", ru: "библиотека", icon: "Library" },
    { ko: "교무실", ru: "учительская", icon: "Users" },
  ],
  faq: [
    { keys: ["어디", "где"], ru: "«어디예요?» — «где?». Ставь название места впереди: «화장실 어디예요?» — «Где туалет?»." },
    { keys: ["저기요", "извин"], ru: "«저기요» — так вежливо зовут человека, как «извините» перед вопросом." },
    { keys: ["옆", "рядом"], ru: "«옆에 있어요» — «находится рядом». 교실 옆 = рядом с классом." },
  ],
};

export const unitB4 = {
  id: "B4",
  part: "B",
  title: { ko: "학교생활", ru: "На уроке" },
  icon: "Presentation",
  goal: { ru: "Понимаем учителя и вежливо спрашиваем разрешения", ko: "선생님 말을 알아듣고 허락을 구해요" },
  steps: [
    {
      type: "scene",
      title: { ru: "Урок начинается", ko: "수업 시간" },
      note: { ru: "Учитель говорит классу, а Алина просит выйти.", ko: "" },
      lines: [
        { who: "teacher", ko: "자, 모두 앉으세요. 조용히 하세요.", ru: "Так, все садитесь. Тише, пожалуйста." },
        { who: "kid", ko: "선생님, 화장실에 가도 돼요?", ru: "Учитель, можно выйти в туалет?" },
        { who: "teacher", ko: "네, 다녀오세요.", ru: "Да, иди и возвращайся." },
        { who: "teacher", ko: "책 15쪽을 보세요.", ru: "Откройте учебник на странице 15." },
        { who: "kid", ko: "잘 모르겠어요. 다시 말해 주세요.", ru: "Я не очень понимаю. Повторите, пожалуйста." },
      ],
    },
    {
      type: "learn",
      title: { ru: "Что говорит учитель", ko: "선생님 말" },
      items: [
        { ko: "앉으세요", ru: "Садитесь", icon: "Armchair" },
        { ko: "일어나세요", ru: "Встаньте", icon: "PersonStanding" },
        { ko: "조용히 하세요", ru: "Тише", icon: "VolumeX" },
        { ko: "보세요", ru: "Смотрите", icon: "Eye" },
        { ko: "들으세요", ru: "Слушайте", icon: "Ear" },
        { ko: "따라 하세요", ru: "Повторяйте", icon: "Repeat" },
        { ko: "손 드세요", ru: "Поднимите руку", icon: "Hand" },
      ],
    },
    {
      type: "listen",
      title: { ru: "Учитель говорит. Что делать?", ko: "선생님이 말해요. 어떻게 해요?" },
      pictures: true,
      q: [
        { say: "앉으세요", options: [{ ko: "앉으세요", icon: "Armchair", label: "сесть" }, { ko: "일어나세요", icon: "PersonStanding", label: "встать" }, { ko: "손 드세요", icon: "Hand", label: "поднять руку" }] },
        { say: "조용히 하세요", options: [{ ko: "보세요", icon: "Eye", label: "смотреть" }, { ko: "조용히 하세요", icon: "VolumeX", label: "молчать" }, { ko: "들으세요", icon: "Ear", label: "слушать" }] },
        { say: "손 드세요", options: [{ ko: "손 드세요", icon: "Hand", label: "поднять руку" }, { ko: "앉으세요", icon: "Armchair", label: "сесть" }, { ko: "따라 하세요", icon: "Repeat", label: "повторить" }] },
        { say: "일어나세요", options: [{ ko: "들으세요", icon: "Ear", label: "слушать" }, { ko: "보세요", icon: "Eye", label: "смотреть" }, { ko: "일어나세요", icon: "PersonStanding", label: "встать" }] },
        { say: "따라 하세요", options: [{ ko: "따라 하세요", icon: "Repeat", label: "повторить" }, { ko: "조용히 하세요", icon: "VolumeX", label: "молчать" }, { ko: "앉으세요", icon: "Armchair", label: "сесть" }] },
      ],
    },
    {
      type: "learn",
      title: { ru: "Что могу сказать я", ko: "내가 하는 말" },
      items: [
        { ko: "화장실에 가도 돼요?", ru: "Можно в туалет?", icon: "Toilet" },
        { ko: "물 마셔도 돼요?", ru: "Можно попить воды?", icon: "GlassWater" },
        { ko: "잘 모르겠어요", ru: "Я не понимаю", icon: "CircleHelp" },
        { ko: "다시 말해 주세요", ru: "Повторите, пожалуйста", icon: "Repeat" },
        { ko: "천천히 말해 주세요", ru: "Говорите медленнее, пожалуйста", icon: "Snail" },
      ],
    },
    {
      type: "choose",
      title: { ru: "Что ты скажешь?", ko: "뭐라고 말해요?" },
      q: [
        { prompt: { ru: "Очень хочется пить.", icon: "GlassWater" }, options: ["물 마셔도 돼요?", "조용히 하세요"], answer: 0 },
        { prompt: { ru: "Учитель говорит слишком быстро.", icon: "Snail" }, options: ["앉으세요", "천천히 말해 주세요"], answer: 1 },
        { prompt: { ru: "Ты не понял задание.", icon: "CircleHelp" }, options: ["잘 모르겠어요", "감사합니다"], answer: 0 },
        { prompt: { ru: "Нужно выйти в туалет.", icon: "Toilet" }, options: ["화장실 어디예요?", "화장실에 가도 돼요?"], answer: 1 },
      ],
    },
    { type: "speak", items: [{ ko: "화장실에 가도 돼요?", ru: "Можно в туалет?" }, { ko: "물 마셔도 돼요?", ru: "Можно попить воды?" }, { ko: "잘 모르겠어요", ru: "Я не понимаю" }, { ko: "다시 말해 주세요", ru: "Повторите, пожалуйста" }] },
    { type: "order", items: [{ ko: "선생님, 화장실에 가도 돼요?", ru: "Учитель, можно в туалет?" }, { ko: "천천히 말해 주세요", ru: "Говорите медленнее" }, { ko: "물 마셔도 돼요?", ru: "Можно попить воды?" }] },
  ],
  words: [
    { ko: "앉으세요", ru: "Садитесь", icon: "Armchair" },
    { ko: "일어나세요", ru: "Встаньте", icon: "PersonStanding" },
    { ko: "조용히 하세요", ru: "Тише", icon: "VolumeX" },
    { ko: "화장실에 가도 돼요?", ru: "Можно в туалет?", icon: "Toilet" },
    { ko: "잘 모르겠어요", ru: "Я не понимаю", icon: "CircleHelp" },
    { ko: "다시 말해 주세요", ru: "Повторите, пожалуйста", icon: "Repeat" },
  ],
  faq: [
    {
      keys: ["돼요", "도 돼", "можно", "가도", "마셔도"],
      ru: "«-아도/어도 돼요?» — так вежливо просят разрешения, как русское «можно…?». 가요 = я иду. 가도 돼요? = можно мне пойти? 마셔요 = пью. 마셔도 돼요? = можно попить?",
    },
    { keys: ["세요", "앉으", "보세요"], ru: "«-세요» в конце — вежливая просьба учителя: 앉으세요 = садитесь, 보세요 = смотрите, 들으세요 = слушайте." },
    { keys: ["주세요", "повтор", "медлен"], ru: "«주세요» — «пожалуйста, сделайте для меня». 다시 말해 주세요 = скажите ещё раз, пожалуйста. 천천히 = медленно." },
  ],
};

export const unitB5 = {
  id: "B5",
  part: "B",
  title: { ko: "아플 때", ru: "Если болит" },
  icon: "Stethoscope",
  goal: { ru: "Говорим, что болит, и просим помощи", ko: "아픈 곳을 말하고 도움을 구해요" },
  steps: [
    {
      type: "scene",
      title: { ru: "В медкабинете", ko: "보건실에서" },
      note: { ru: "У Тимура заболел живот. Он идёт к школьной медсестре.", ko: "" },
      lines: [
        { who: "kid", ko: "선생님, 배가 아파요.", ru: "Учитель, у меня болит живот." },
        { who: "teacher", ko: "보건실에 가고 싶어요?", ru: "Хочешь пойти в медкабинет?" },
        { who: "kid", ko: "네, 보건실에 가고 싶어요.", ru: "Да, хочу в медкабинет." },
        { who: "nurse", ko: "어디가 아파요? 열이 나요?", ru: "Где болит? Есть температура?" },
        { who: "kid", ko: "아니요, 배만 아파요.", ru: "Нет, только живот болит." },
      ],
    },
    {
      type: "learn",
      items: [
        { ko: "머리", ru: "голова", icon: "Brain" },
        { ko: "배", ru: "живот", icon: "CircleDot" },
        { ko: "이", ru: "зуб", icon: "Smile" },
        { ko: "목", ru: "горло", icon: "Mic" },
        { ko: "다리", ru: "нога", icon: "Footprints" },
        { ko: "아파요", ru: "болит", icon: "Frown" },
        { ko: "열이 나요", ru: "у меня температура", icon: "Thermometer" },
        { ko: "괜찮아요", ru: "всё хорошо", icon: "ThumbsUp" },
      ],
    },
    {
      type: "grammar",
      title: { ru: "이 или 가?", ko: "이? 가?" },
      rule: { ru: "«Болит …»: патчим есть — 이 (목이 아파요), нет — 가 (배가 아파요).", ko: "받침이 있으면 '이', 없으면 '가'." },
      examples: [
        { ko: "배가 아파요", ru: "배 - нет патчима" },
        { ko: "목이 아파요", ru: "목 - есть патчим ㄱ" },
      ],
      q: [
        { word: "머리", answer: "가" },
        { word: "목", answer: "이" },
        { word: "다리", answer: "가" },
        { word: "손", answer: "이" },
        { word: "배", answer: "가" },
      ],
      options: ["이", "가"],
      suffix: " 아파요",
    },
    {
      type: "listen",
      title: { ru: "Что болит?", ko: "어디가 아파요?" },
      pictures: true,
      q: [
        { say: "머리가 아파요", options: [{ ko: "머리", icon: "Brain" }, { ko: "배", icon: "CircleDot" }, { ko: "다리", icon: "Footprints" }] },
        { say: "다리가 아파요", options: [{ ko: "목", icon: "Mic" }, { ko: "다리", icon: "Footprints" }, { ko: "이", icon: "Smile" }] },
        { say: "열이 나요", options: [{ ko: "괜찮아요", icon: "ThumbsUp" }, { ko: "배", icon: "CircleDot" }, { ko: "열이 나요", icon: "Thermometer" }] },
        { say: "배가 아파요", options: [{ ko: "배", icon: "CircleDot" }, { ko: "머리", icon: "Brain" }, { ko: "목", icon: "Mic" }] },
      ],
    },
    { type: "speak", items: [{ ko: "배가 아파요", ru: "Болит живот" }, { ko: "머리가 아파요", ru: "Болит голова" }, { ko: "보건실에 가고 싶어요", ru: "Хочу в медкабинет" }, { ko: "열이 나요", ru: "У меня температура" }] },
    { type: "order", items: [{ ko: "선생님, 머리가 아파요", ru: "Учитель, у меня болит голова" }, { ko: "보건실에 가고 싶어요", ru: "Хочу в медкабинет" }] },
  ],
  words: [
    { ko: "머리", ru: "голова", icon: "Brain" },
    { ko: "배", ru: "живот", icon: "CircleDot" },
    { ko: "목", ru: "горло", icon: "Mic" },
    { ko: "아파요", ru: "болит", icon: "Frown" },
    { ko: "열이 나요", ru: "температура", icon: "Thermometer" },
    { ko: "괜찮아요", ru: "всё хорошо", icon: "ThumbsUp" },
  ],
  faq: [
    { keys: ["아파", "болит"], ru: "«아파요» — «болит». Сначала часть тела, потом 이/가: 배가 아파요 = болит живот. Если очень плохо, сразу скажи учителю: «선생님, 아파요!»" },
    { keys: ["싶어요", "хочу"], ru: "«-고 싶어요» — «хочу…». 가고 싶어요 = хочу пойти. 보건실에 가고 싶어요 = хочу в медкабинет." },
    { keys: ["목이", "배가", "이 아파", "가 아파"], ru: "После слова с патчимом — 이 (목이), без патчима — 가 (배가). Значение одно и то же." },
  ],
};

export const unitC1 = {
  id: "C1",
  part: "C",
  title: { ko: "교과서 지시어", ru: "Слова заданий" },
  icon: "ClipboardList",
  goal: { ru: "Понимаем, что просят сделать в учебнике", ko: "교과서 문제가 무엇을 하라는지 알아요" },
  steps: [
    {
      type: "intro",
      title: { ru: "Каждое задание начинается с глагола", ko: "문제는 '무엇을 하세요'로 끝나요" },
      blocks: [
        { ru: "В учебнике задания почти всегда заканчиваются на -세요: 읽으세요 (читайте), 쓰세요 (пишите).", ko: "" },
        { ru: "Если ты знаешь эти 8 слов, ты поймёшь, ЧТО делать, даже если не понимаешь всё задание.", ko: "이 낱말 8개를 알면 무엇을 해야 하는지 알 수 있어요." },
      ],
      show: ["읽으세요", "쓰세요", "고르세요"],
    },
    {
      type: "learn",
      items: [
        { ko: "읽으세요", ru: "прочитайте", icon: "BookOpen" },
        { ko: "쓰세요", ru: "напишите", icon: "PencilLine" },
        { ko: "고르세요", ru: "выберите", icon: "MousePointerClick" },
        { ko: "동그라미 하세요", ru: "обведите в кружок", icon: "Circle" },
        { ko: "밑줄을 그으세요", ru: "подчеркните", icon: "Underline" },
        { ko: "연결하세요", ru: "соедините линией", icon: "Spline" },
        { ko: "빈칸에 쓰세요", ru: "впишите в пропуск", icon: "SquareDashed" },
        { ko: "짝과 이야기하세요", ru: "поговорите с соседом по парте", icon: "MessagesSquare" },
      ],
    },
    {
      type: "task",
      title: { ru: "Сделай, что просят", ko: "문제대로 해 보세요" },
      q: [
        { kind: "circle", ko: "사과에 동그라미 하세요.", ru: "Обведите яблоко в кружок.", options: [{ id: "apple", icon: "Apple", ko: "사과" }, { id: "banana", icon: "Banana", ko: "바나나" }, { id: "carrot", icon: "Carrot", ko: "당근" }], answer: "apple" },
        { kind: "underline", ko: "'학교'에 밑줄을 그으세요.", ru: "Подчеркните слово «학교».", tokens: ["나는", "학교에", "가요."], answer: 1 },
        { kind: "circle", ko: "연필을 고르세요.", ru: "Выберите карандаш.", options: [{ id: "ruler", icon: "Ruler", ko: "자" }, { id: "pencil", icon: "Pencil", ko: "연필" }, { id: "book", icon: "BookOpen", ko: "책" }], answer: "pencil" },
        { kind: "fill", ko: "빈칸에 쓰세요: 저는 학생___.", ru: "Впишите в пропуск: Я ученик___.", options: ["이에요", "예요"], answer: 0 },
        { kind: "underline", ko: "'물'에 밑줄을 그으세요.", ru: "Подчеркните слово «물».", tokens: ["물", "주세요."], answer: 0 },
      ],
    },
    {
      type: "listen",
      title: { ru: "Что нужно сделать?", ko: "무엇을 해요?" },
      pictures: true,
      q: [
        { say: "읽으세요", options: [{ ko: "읽으세요", icon: "BookOpen", label: "читать" }, { ko: "쓰세요", icon: "PencilLine", label: "писать" }, { ko: "연결하세요", icon: "Spline", label: "соединить" }] },
        { say: "밑줄을 그으세요", options: [{ ko: "동그라미 하세요", icon: "Circle", label: "обвести" }, { ko: "밑줄을 그으세요", icon: "Underline", label: "подчеркнуть" }, { ko: "고르세요", icon: "MousePointerClick", label: "выбрать" }] },
        { say: "짝과 이야기하세요", options: [{ ko: "쓰세요", icon: "PencilLine", label: "писать" }, { ko: "읽으세요", icon: "BookOpen", label: "читать" }, { ko: "짝과 이야기하세요", icon: "MessagesSquare", label: "поговорить" }] },
        { say: "동그라미 하세요", options: [{ ko: "동그라미 하세요", icon: "Circle", label: "обвести" }, { ko: "빈칸에 쓰세요", icon: "SquareDashed", label: "вписать" }, { ko: "밑줄을 그으세요", icon: "Underline", label: "подчеркнуть" }] },
      ],
    },
    { type: "speak", items: [{ ko: "읽으세요", ru: "прочитайте" }, { ko: "쓰세요", ru: "напишите" }, { ko: "동그라미 하세요", ru: "обведите в кружок" }, { ko: "밑줄을 그으세요", ru: "подчеркните" }] },
  ],
  words: [
    { ko: "읽으세요", ru: "прочитайте", icon: "BookOpen" },
    { ko: "쓰세요", ru: "напишите", icon: "PencilLine" },
    { ko: "고르세요", ru: "выберите", icon: "MousePointerClick" },
    { ko: "동그라미 하세요", ru: "обведите в кружок", icon: "Circle" },
    { ko: "밑줄을 그으세요", ru: "подчеркните", icon: "Underline" },
    { ko: "연결하세요", ru: "соедините линией", icon: "Spline" },
    { ko: "빈칸에 쓰세요", ru: "впишите в пропуск", icon: "SquareDashed" },
    { ko: "짝과 이야기하세요", ru: "поговорите с соседом", icon: "MessagesSquare" },
  ],
  faq: [
    { keys: ["동그라미", "круж"], ru: "«동그라미» — кружок. «동그라미 하세요» — обведите правильный ответ кружком ○." },
    { keys: ["밑줄", "подчерк"], ru: "«밑줄» — линия снизу. «밑줄을 그으세요» — подчеркните слово линией." },
    { keys: ["빈칸", "пропуск"], ru: "«빈칸» — пустая клеточка. «빈칸에 쓰세요» — впишите ответ в пустое место." },
    { keys: ["짝", "сосед"], ru: "«짝» — сосед по парте. «짝과 이야기하세요» — поговорите с соседом." },
  ],
};
