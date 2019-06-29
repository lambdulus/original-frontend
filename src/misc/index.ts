import { strict } from "assert";

export function debounce (fn : Function, treshold : number)
 : [ (...args : Array<any>) => void, () => void ] {
  let timer : number
  
  return [
    function debounced (...args : Array<any>) : void {
      window.clearTimeout(timer)

      timer = window.setTimeout(() => {
        fn(...args)
      }, treshold)
    },
    function cancel () : void {
      window.clearTimeout(timer)
    }
  ]
}

export function mapRightFromTo(
  from : number,
  to : number,
  sequence : Array<any>,
  fn : (...args : Array<any>) => any) {
    const result : Array<any> = new Array(to - from + 1)

    for (let e = 0, i = to; i >= from; --i) {
      result[e++] = fn(sequence[i], i)
    }

    return result
  }

export function trimStr (str : string) : string {
  return str.trim()
}