"""Voiceover v2 (sequential movies -> reality), SA_miro voice, Egyptian IPA."""
import numpy as np, soundfile as sf
from piper import PiperVoice
from piper.config import SynthesisConfig

V = PiperVoice.load('vits-piper-ar_JO-SA_miro-high/ar_JO-SA_miro-high.onnx')
SR = V.config.sample_rate
MA = [3.0, 8.0, 13.0]; MX = 18.0; BR = 20.0; RA = [21.6, 27.0, 32.5]; F = 38.0; END = 48.2

L = [
 (0.3, 2.95, 'fil ʔaflˈaːm wil musalsalˈaːt, ilmitdˈajjin lˈiːh sˤˈuːra wˈaħda.'),
 (MA[0] + .4, MA[1] - .2, 'dˈajman mikˈaʃʃar, wi ʔˈaːfil ʕˈala nˈafsu.'),
 (MA[1] + .3, MA[2] - .2, 'bizˈaʕʕaʔ fi nnˈaːs, wi bixˈaːsˤim iddˈunja kullˈaha.'),
 (MA[2] + .3, MX - .1, 'wi ʕˈaːjiʃ liwˈaħdu, maʕzˈuːl ʕan ilħajˈaːh.'),
 (MX + .15, BR, 'bˈass dˈa miʃ ħaʔˈiːʔi!'),
 (BR + .15, RA[0] - .05, 'tˤˈab, wil wˈaːʔiʕ?'),
 (RA[0] + .3, RA[1] - .1, 'ilmitdˈajjin ilħaʔˈiːʔi bijsˤˈalli wi bisˤˈuːm wi biʔˈuːm illˈeːl, wi ʔˈalbu mirtˈaːħ.'),
 (RA[1] + .2, RA[2] - .1, 'wi bijˈidˤħak wi jhˈazzar mˈaʕa sˤħˈaːbu, wi jilʕˈabu blajstˈeːʃin kamˈaːn!'),
 (RA[2] + .2, F - .1, 'bijħˈibb ˈahlu wi bijbˈirruhum, wi bizˈaːkir wi jiʃtˈaɣal wi jˈilʕab rijˈaːdˤa.'),
 (F + .35, F + 3.4, 'ittadˈajjun ʕˈumru ma kˈaːn taʃˈaddud wˈala ʔinʕizˈaːl.'),
 (F + 3.3, F + 4.55, 'ilʔˈaːʕda basˈiːtˤa.'),
 (F + 4.6, F + 6.35, 'ˈaj ħˈaːga ma btiɣdˤˈabʃ rabbˈina,'),
 (F + 6.4, F + 7.4, 'ʕiʃˈhaː!'),
]

def synth(ipa, ls):
    a = V.phoneme_ids_to_audio(V.phonemes_to_ids(list(ipa)), SynthesisConfig(length_scale=ls, noise_scale=0.6, noise_w_scale=0.75))
    a = np.asarray(a, np.float32).flatten()
    nz = np.nonzero(np.abs(a) > 0.004)[0]
    a = a[max(0, nz[0] - 200): nz[-1] + 900] if len(nz) else a
    return a / (np.abs(a).max() + 1e-9) * 0.9

out = np.zeros(int((END + 1) * SR), np.float32); log = []
for st, en, ipa in L:
    ls = 1.0; a = synth(ipa, ls)
    while len(a) / SR > en - st and ls > 0.78:
        ls -= 0.04; a = synth(ipa, ls)
    i = int(st * SR); out[i:i + len(a)] += a
    log.append(f'{st:6.2f} {len(a)/SR:5.2f}/{en-st:4.2f} ls={ls:.2f}')
out = out[:int(END * SR)]
sf.write('vo2.wav', out / np.abs(out).max() * 0.9, SR)
print('\n'.join(log))
