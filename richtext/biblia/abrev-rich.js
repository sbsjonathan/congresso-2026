const ABREVIACOES = {
  // GENESIS
  "gn": "genesis",
  "ge": "genesis",
  "gen": "genesis",
  "genesis": "genesis",

  // EXODO
  "ex": "exodo",
  "exo": "exodo",
  "exod": "exodo",
  "exodo": "exodo",

  // LEVITICO
  "lv": "levitico",
  "le": "levitico",
  "lev": "levitico",
  "levit": "levitico",
  "levitico": "levitico",

  // NUMEROS
  "nm": "numeros",
  "nu": "numeros",
  "num": "numeros",
  "numeros": "numeros",

  // DEUTERONOMIO
  "dt": "deuteronomio",
  "de": "deuteronomio",
  "deu": "deuteronomio",
  "deut": "deuteronomio",
  "deutero": "deuteronomio",
  "deuteronomio": "deuteronomio",

  // JOSUE
  "js": "josue",
  "jos": "josue",
  "josue": "josue",

  // JUIZES
  "jz": "juizes",
  "jui": "juizes",
  "juiz": "juizes",
  "juizes": "juizes",

  // RUTE
  "rt": "rute",
  "ru": "rute",
  "rut": "rute",
  "rute": "rute",

  // 1 SAMUEL
  "1sm": "1samuel",
  "1sa": "1samuel",
  "1sam": "1samuel",
  "1samuel": "1samuel",

  // 2 SAMUEL
  "2sm": "2samuel",
  "2sa": "2samuel",
  "2sam": "2samuel",
  "2samuel": "2samuel",

  // 1 REIS
  "1rs": "1reis",
  "1re": "1reis",
  "1rei": "1reis",
  "1reis": "1reis",

  // 2 REIS
  "2rs": "2reis",
  "2re": "2reis",
  "2rei": "2reis",
  "2reis": "2reis",

  // 1 CRONICAS
  "1cr": "1cronicas",
  "1cro": "1cronicas",
  "1cron": "1cronicas",
  "1cronicas": "1cronicas",

  // 2 CRONICAS
  "2cr": "2cronicas",
  "2cro": "2cronicas",
  "2cron": "2cronicas",
  "2cronicas": "2cronicas",

  // ESDRAS
  "ed": "esdras",
  "esd": "esdras",
  "esdras": "esdras",

  // NEEMIAS
  "ne": "neemias",
  "nee": "neemias",
  "neem": "neemias",
  "neemias": "neemias",

  // ESTER
  "et": "ester",
  "est": "ester",
  "ester": "ester",

  // JO
  "jo": "jo",

  // SALMOS
  "sl": "salmos",
  "sal": "salmos",
  "salm": "salmos",
  "salmo": "salmos",
  "salmos": "salmos",

  // PROVERBIOS
  "pv": "proverbios",
  "pr": "proverbios",
  "prov": "proverbios",
  "proverbio": "proverbios",
  "proverbios": "proverbios",

  // ECLESIASTES
  "ec": "eclesiastes",
  "ecl": "eclesiastes",
  "ecle": "eclesiastes",
  "ecles": "eclesiastes",
  "eclesiastes": "eclesiastes",

  // CANTICOS
  "ct": "canticos",
  "can": "canticos",
  "cant": "canticos",
  "cantico": "canticos",
  "canticos": "canticos",
  "canticodoscanticos": "canticos",

  // ISAIAS
  "is": "isaias",
  "isa": "isaias",
  "isai": "isaias",
  "isaias": "isaias",

  // JEREMIAS
  "jr": "jeremias",
  "je": "jeremias",
  "jer": "jeremias",
  "jerem": "jeremias",
  "jeremias": "jeremias",

  // LAMENTACOES
  "lm": "lamentacoes",
  "lam": "lamentacoes",
  "lament": "lamentacoes",
  "lamentacao": "lamentacoes",
  "lamentacoes": "lamentacoes",

  // EZEQUIEL
  "ez": "ezequiel",
  "eze": "ezequiel",
  "ezeq": "ezequiel",
  "ezequiel": "ezequiel",

  // DANIEL
  "dn": "daniel",
  "da": "daniel",
  "dan": "daniel",
  "daniel": "daniel",

  // OSEIAS
  "os": "oseias",
  "ose": "oseias",
  "oseias": "oseias",

  // JOEL
  "jl": "joel",
  "joe": "joel",
  "joel": "joel",

  // AMOS
  "am": "amos",
  "amo": "amos",
  "amos": "amos",

  // OBADIAS
  "ob": "obadias",
  "oba": "obadias",
  "obad": "obadias",
  "obadias": "obadias",

  // JONAS
  "jn": "jonas",
  "jon": "jonas",
  "jonas": "jonas",

  // MIQUEIAS
  "mq": "miqueias",
  "miq": "miqueias",
  "miqueias": "miqueias",

  // NAUM
  "na": "naum",
  "nau": "naum",
  "naum": "naum",

  // HABACUQUE
  "hc": "habacuque",
  "ha": "habacuque",
  "hab": "habacuque",
  "habac": "habacuque",
  "habacuque": "habacuque",

  // SOFONIAS
  "sf": "sofonias",
  "sof": "sofonias",
  "sofon": "sofonias",
  "sofonias": "sofonias",

  // AGEU
  "ag": "ageu",
  "age": "ageu",
  "ageu": "ageu",

  // ZACARIAS
  "zc": "zacarias",
  "za": "zacarias",
  "zac": "zacarias",
  "zacar": "zacarias",
  "zacarias": "zacarias",

  // MALAQUIAS
  "ml": "malaquias",
  "mal": "malaquias",
  "malaq": "malaquias",
  "malaquias": "malaquias",

  // MATEUS
  "mt": "mateus",
  "mat": "mateus",
  "mate": "mateus",
  "mateus": "mateus",

  // MARCOS
  "mc": "marcos",
  "mr": "marcos",
  "mar": "marcos",
  "marc": "marcos",
  "marcos": "marcos",

  // LUCAS
  "lc": "lucas",
  "lu": "lucas",
  "luc": "lucas",
  "lucas": "lucas",

  // JOAO
  "joao": "joao",

  // ATOS
  "at": "atos",
  "ato": "atos",
  "atos": "atos",

  // ROMANOS
  "rm": "romanos",
  "ro": "romanos",
  "rom": "romanos",
  "roman": "romanos",
  "romanos": "romanos",

  // 1 CORINTIOS
  "1co": "1corintios",
  "1cor": "1corintios",
  "1corint": "1corintios",
  "1corintios": "1corintios",

  // 2 CORINTIOS
  "2co": "2corintios",
  "2cor": "2corintios",
  "2corint": "2corintios",
  "2corintios": "2corintios",

  // GALATAS
  "gl": "galatas",
  "ga": "galatas",
  "gal": "galatas",
  "galat": "galatas",
  "galatas": "galatas",

  // EFESIOS
  "ef": "efesios",
  "efe": "efesios",
  "efes": "efesios",
  "efesios": "efesios",

  // FILIPENSES
  "fp": "filipenses",
  "fl": "filipenses",
  "fil": "filipenses",
  "filip": "filipenses",
  "filipenses": "filipenses",

  // COLOSSENSES
  "cl": "colossenses",
  "co": "colossenses",
  "col": "colossenses",
  "colos": "colossenses",
  "colossenses": "colossenses",

  // 1 TESSALONICENSES
  "1ts": "1tessalonicenses",
  "1te": "1tessalonicenses",
  "1tes": "1tessalonicenses",
  "1tess": "1tessalonicenses",
  "1tessa": "1tessalonicenses",
  "1tessalonicenses": "1tessalonicenses",

  // 2 TESSALONICENSES
  "2ts": "2tessalonicenses",
  "2te": "2tessalonicenses",
  "2tes": "2tessalonicenses",
  "2tess": "2tessalonicenses",
  "2tessa": "2tessalonicenses",
  "2tessalonicenses": "2tessalonicenses",

  // 1 TIMOTEO
  "1tm": "1timoteo",
  "1ti": "1timoteo",
  "1tim": "1timoteo",
  "1timoteo": "1timoteo",

  // 2 TIMOTEO
  "2tm": "2timoteo",
  "2ti": "2timoteo",
  "2tim": "2timoteo",
  "2timoteo": "2timoteo",

  // TITO
  "tt": "tito",
  "ti": "tito",
  "tit": "tito",
  "tito": "tito",

  // FILEMON
  "fm": "filemon",
  "flm": "filemon",
  "file": "filemon",
  "filem": "filemon",
  "filemon": "filemon",

  // HEBREUS
  "hb": "hebreus",
  "he": "hebreus",
  "heb": "hebreus",
  "hebr": "hebreus",
  "hebreus": "hebreus",

  // TIAGO
  "tg": "tiago",
  "tia": "tiago",
  "tiag": "tiago",
  "tiago": "tiago",

  // 1 PEDRO
  "1pe": "1pedro",
  "1pd": "1pedro",
  "1ped": "1pedro",
  "1pedro": "1pedro",

  // 2 PEDRO
  "2pe": "2pedro",
  "2pd": "2pedro",
  "2ped": "2pedro",
  "2pedro": "2pedro",

  // 1 JOAO
  "1jo": "1joao",
  "1joa": "1joao",
  "1joao": "1joao",

  // 2 JOAO
  "2jo": "2joao",
  "2joa": "2joao",
  "2joao": "2joao",

  // 3 JOAO
  "3jo": "3joao",
  "3joa": "3joao",
  "3joao": "3joao",

  // JUDAS
  "jd": "judas",
  "jud": "judas",
  "judas": "judas",

  // APOCALIPSE
  "ap": "apocalipse",
  "apo": "apocalipse",
  "apoc": "apocalipse",
  "apocal": "apocalipse",
  "apocalipse": "apocalipse",

};

if (typeof window !== 'undefined') { window.ABREVIACOES = ABREVIACOES; }