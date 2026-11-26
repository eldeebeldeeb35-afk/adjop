"""Egyptian-colloquial voiceover for the comparison reel, synthesised from hand-written IPA."""
import numpy as np, soundfile as sf
from piper import PiperVoice
from piper.config import SynthesisConfig

V = PiperVoice.load('vits-piper-ar_JO-kareem-medium/ar_JO-kareem-medium.onnx')
SR = V.config.sample_rate
PAIRS = [3.9, 12.9, 21.9]; F = 30.9

# (start, latest end, arabic text, IPA in Egyptian pronunciation)
L = [
 (0.35, 3.6, 'المتدين.. في الأفلام، وفي الواقع!', 'ilmitdˈajjin... fil ʔaflˈaːm, wi fil wˈaːʔiʕ!'),
]
P = [
 [('في الأفلام.. المتدين مكشّر وقافل على نفسه.', 'fil ʔaflˈaːm, ilmitdˈajjin mikˈaʃʃar wi ʔˈaːfil ʕˈala nˈafsu.'),
  ('لكن في الواقع؟ بيصلّي.. وقلبه مرتاح.', 'lˈaːkin fil wˈaːʔiʕ? bijsˤˈalli, wi ʔˈalbu mirtˈaːħ.'),
  ('وبيصوم وبيقوم الليل كمان.', 'wi bisˤˈuːm wi biʔˈuːm illˈeːl kamˈaːn.')],
 [('في الأفلام.. بيزعّق، وبيخاصم الناس.', 'fil ʔaflˈaːm... bizˈaʕʕaʔ, wi bixˈaːsˤim innˈaːs.'),
  ('وفي الواقع؟ بيضحك ويهزّر مع صحابه.', 'wi fil wˈaːʔiʕ? bijˈidˤħak wi jhˈazzar mˈaʕa sˤħˈaːbu.'),
  ('ويلعبوا بلايستيشن كمان!', 'wi jilʕˈabu blajstˈeːʃin kamˈaːn!')],
 [('في الأفلام.. قاعد لوحده، ومعزول.', 'fil ʔaflˈaːm... ʔˈaːʕid liwˈaħdu, wi maʕzˈuːl.'),
  ('وفي الواقع؟ بيحب أهله، وبيبرّهم.', 'wi fil wˈaːʔiʕ? bijħˈibb ˈahlu, wi bijbˈirruhum.'),
  ('بيذاكر وبيشتغل.. وبيلعب رياضة.', 'bizˈaːkir wi biʃtˈaɣal, wi bjˈilʕab rijˈaːdˤa.')],
]
for s, lines in zip(PAIRS, P):
    L += [(s + .15, s + 3.25, *lines[0]), (s + 3.3, s + 6.2, *lines[1]), (s + 6.25, s + 8.85, *lines[2])]
L += [(F + .35, F + 3.4, 'التدين عمره ما كان تشدد ولا انعزال.', 'ittadˈajjun ʕˈumru ma kˈaːn taʃˈaddud wˈala ʔinʕizˈaːl.'),
      (F + 3.45, F + 4.75, 'القاعدة بسيطة:', 'ilʔˈaːʕda basˈiːtˤa.'),
      (F + 4.8, F + 6.25, 'أي حاجة مبتغضبش ربنا..', 'ˈaj ħˈaːga ma btiɣdˤˈabʃ rabbˈina,'),
      (F + 6.3, F + 7.3, 'عيشها!', 'ʕiʃˈhaː!')]

def synth(ipa, ls=1.0):
    ids = V.phonemes_to_ids(list(ipa))
    a = V.phoneme_ids_to_audio(ids, SynthesisConfig(length_scale=ls, noise_scale=0.55, noise_w_scale=0.7))
    a = np.asarray(a, dtype=np.float32).flatten()
    # trim silence
    nz = np.nonzero(np.abs(a) > 0.01)[0]
    return a[max(0, nz[0] - 200): nz[-1] + 800] if len(nz) else a

DUR = F + 10.2
out = np.zeros(int(DUR * SR) + SR, np.float32)
log = []
for start, end, ar, ipa in L:
    ls = 0.86
    a = synth(ipa, ls)
    win = end - start
    while len(a) / SR > win and ls > 0.7:
        ls -= 0.04; a = synth(ipa, ls)
    # the k1 line must finish before "عيشها"
    i = int(start * SR); out[i:i + len(a)] += a
    log.append(f'{start:6.2f} {len(a)/SR:5.2f}s/{win:4.2f} ls={ls:.2f} {ar}')
out = out[:int(DUR * SR)]
out /= np.abs(out).max() / 0.9
sf.write('vo.wav', out, SR)
print('\n'.join(log))
