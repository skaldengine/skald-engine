import inclusiveRandom from 'sk/utils/random/inclusiveRandom'

/**
 * Chooses a value in the interval [-1, 1], which can be multiplied by the 
 * provided multiplier parameter.
 *
 * @param {Number} [multiplier=1] - The multiplier to scale the result
 * @return {Number}
 */
export default function polar(multiplier=1) {
  return multiplier*(inclusiveRandom()*2 - 1)
}