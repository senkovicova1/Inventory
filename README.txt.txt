V tejto zlozke je cely zdrojovy kod mojej aplikacie.                  
V zlozke js je vacsina mojej prace - sú v nej komponenty, navigacia, redux zlozky... 

Su v nom zahnute aj node_modules a vsetky kluce, ktore su potrebne na pripojenie sa do databazy atd, 
takze okrem react-native run-android by nemalo byt potrebne pisat ziadne ine prikazy na spustenie.
Ak bude treba si vygenerovat nove node_modules, robi sa to prikazom npm install.
Ak si bude treba vygenerovat novu android zlozku, robi sa to cez react-native link. 
Ale kedze niektore z tych suborov som menila a vkladala do nich kluce a ine riadky kodu, 
ked v konzole dostanete moznost si ponechat tieto subory, ponechajte ich a nechajte vygenerovat vsetko ostatne.
Inak aplikacia nemusi spravne fungovat, v niektorych pripadoch ani spustit.