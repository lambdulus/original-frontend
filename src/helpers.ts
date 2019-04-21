import { ASTVisitor, AST, Application, Lambda, ChurchNumber, Macro, Variable } from "lambdulus-core"


export function debounce (fn : Function, treshold : number) {
  let timer : number
  
  return function debounced (...args : Array<any>) {
  	window.clearTimeout(timer)

  	timer = window.setTimeout(() => {
    	fn(...args)
    }, treshold)
  }
}

// intentionaly not handling `this` - I don't want debounced callback to (ab)use `this`

export function trimStr (str : string) {
  return str.trim()
}

///////////////////////////////////////////////////////////////////////////////////////

type Pair<T, E> = [T, E]

// TODO: fix the public equals interface, maybe public get and private set?
// maybe implement public get method and bool itself leave private?
export class TreeComparator {
  private translator : Map<string, string> = new Map
  public equals : boolean = true
  private context : Pair<AST, AST>

  constructor (readonly roots : Pair<AST, AST> ) {
    this.context = roots
    this.compare()
  }

  compare () : void {
    const [ left, right ] : Pair<AST, AST> = this.context

    if (left instanceof Lambda && right instanceof Lambda) {
      const backup : Map<string, string> = new Map(this.translator.entries())

      this.translator.set(left.argument.name(), right.argument.name())
      this.context = [ left.right, right.right]
      this.compare()

      this.translator = backup
    }
    else if (left instanceof Application && right instanceof Application) {
      this.context = [ left.left, right.left ]
      this.compare()

      if ( ! this.equals) {
        return
      }

      this.context = [ left.right, right.right ]
      this.compare()
    }
    else if (left instanceof Macro && right instanceof Macro) {
      this.equals = left.name() === right.name()
    }
    else if (left instanceof ChurchNumber && right instanceof ChurchNumber) {
      this.equals = left.name() === right.name()
    }
    else if (left instanceof Variable && right instanceof Variable) {
      this.equals = this.translator.get(left.name()) === right.name()
    }
    else {
      this.equals = false
    }
  }

  // sameType (left : AST, right : AST) : boolean {
  //   return (
  //     left instanceof Lambda && right instanceof Lambda
  //     ||
  //     left instanceof Application && right instanceof Application
  //     ||
  //     left instanceof Macro && right instanceof Macro
  //     ||
  //     left instanceof ChurchNumber && right instanceof ChurchNumber
  //     ||
  //     left instanceof Variable && right instanceof Variable
  //   )
  // }
}