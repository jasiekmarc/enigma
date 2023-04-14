# Enigma simulator

This simple Enigma machine simulator has been implemented to familiarise the
audience of my [lecture](https://ii.uni.wroc.pl/dla-studenta/drzwi-otwarte) on
[Marian Rejewski's Enigma breakthrough of
1932](https://en.wikipedia.org/wiki/Cryptanalysis_of_the_Enigma#Polish_breakthroughs)
with the machine's mechanism.

## Usage

Click any letter on the keyboard and observe the lampboard. One of the lamps
will light-up. Hold the key to trace the path the electric current must travel
from the keyboard to the lampboard.

A subsequent pressing of the same key will (usually) cause a different lamp to
light-up. The current is passing through ‘rotors’—wheels connecting 26
electrical contacts on the left side to 26 contacts on the right by a
permutation. Every key-press causes the rightmost rotor to move one step. The
middle rotor is pused one-step forward by the rightmost once every 26 steps,
etc.