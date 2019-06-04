import rules from './base.json'
import { AST, Lambda, Application, Macro, ChurchNumber, Variable, NormalEvaluator, Beta, Binary, ApplicativeEvaluator, Alpha } from 'lambdulus-core';

export interface Answer {
  valid : boolean,
  warnings ? : Array<string>,
  errors ? : Array<string>,
}

// hotfix

const rules__g = rules

// hotfix

function compareWhole (next : AST, user : AST) : boolean {
  if (next instanceof Lambda && user instanceof Lambda
      ||
      next instanceof Application && user instanceof Application
  ) {
    const left : boolean = compareWhole(next.left, user.left)
    if ( ! left) {
      return left
    }
    else {
      return compareWhole(next.right, user.right)
    }
  }
  else if (next instanceof Macro && user instanceof Macro
          ||
          next instanceof ChurchNumber && user instanceof ChurchNumber
          ||
          next instanceof Variable && user instanceof Variable
  ) {
    if (next.name() !== user.name()) {
      return false
    }
    return true
  }

  return false
}

function compareUntil (next : AST, user : AST, target : symbol) : boolean {
  if (next instanceof Lambda && user instanceof Lambda
      ||
      next instanceof Application && user instanceof Application
  ) {
    if (next.identifier === target) {
      return true
    }
    
    const left : boolean = compareUntil
  (next.left, user.left, target)
    if ( ! left) {
      return left
    }
    else {
      return compareUntil
    (next.right, user.right, target)
    }
  }
  else if (next instanceof Macro && user instanceof Macro
          ||
          next instanceof ChurchNumber && user instanceof ChurchNumber
          ||
          next instanceof Variable && user instanceof Variable
  ) {
    if (next.identifier === target) {
      return true
    }

    if (next.name() !== user.name()) {
      return false
    }
    return true
  }

  return false
}

function getEquivalent (next : AST, user : AST, target : symbol) : AST| null {
  if (next instanceof Lambda && user instanceof Lambda
      ||
      next instanceof Application && user instanceof Application
  ) {
    if (next.identifier === target) {
      return user
    }
    
    const left : boolean = compareUntil
  (next.left, user.left, target)
    if ( ! left) {
      return null
    }
    else {
      return getEquivalent(next.right, user.right, target)
    }
  }
  else if (next instanceof Macro && user instanceof Macro
          ||
          next instanceof ChurchNumber && user instanceof ChurchNumber
          ||
          next instanceof Variable && user instanceof Variable
  ) {
    if (next.identifier === target) {
      return user
    }

    if (next.name() !== user.name()) {
      return null
    }
    return null
  }

  return null
}

function redexSymbol (node : AST) : symbol {
  return node.identifier
}

function betaRedex (old : AST) : AST | null {
  const normal : NormalEvaluator = new NormalEvaluator(old)

  if (normal.nextReduction instanceof Beta
    &&
    normal.nextReduction.parent !== null
    &&
    normal.nextReduction.treeSide !== null) {
    return normal.nextReduction.parent[normal.nextReduction.treeSide]
  }

  return null
}

function reduceApplicative (tree : AST) : AST {
  const applicative : ApplicativeEvaluator = new ApplicativeEvaluator(tree)

  return applicative.perform()
}

function verify (predicate : string, old : AST, correct : AST, user : AST) : Answer {
  switch (predicate) {
    case 'should-do-beta' : {
      // console.log('BUBBLY')
      const normal : NormalEvaluator = new NormalEvaluator(old)
      
      if (normal.nextReduction instanceof Beta) {
        return { valid : true }
      }

      return { valid : false, errors : [ `Next reduction should not be Beta.`]}
    }
    case 'old-same-or-equivalent-to-user' : {
      if (compareWhole(old, user)) {
        return { valid : true }
      }

      return { valid : false, errors : [ `User's and old trees are not equivalent.` ]}
    }
    case 'same-or-equivalent-until-beta-redex' : { // TODO: zatim jenom SAME
      const redex : AST | null = betaRedex(old)
      if (redex === null) {
        // redex === null -> nejde o Beta redukci
        return { valid : false, errors : [ `I cannot find beta redex because next reduction is not beta` ] }
      }

      const id : symbol = redexSymbol(redex)
      if (compareUntil
      (correct, user, id)) {
        return { valid : true }
      }

      return { valid : false }
    }
    case 'beta-redex-left-side-same-or-equivalent' : {
      const redex : AST | null = betaRedex(old)
      if (redex === null) {
        return { valid : true, errors : [ `I cannot find beta redex because next reduction is not beta` ] }
      }

      const userRedex : AST | null = getEquivalent(correct, user, redexSymbol(redex))

      if (userRedex === null) {
        return { valid : false, errors : [ `I cannot find user redex equivalent.` ]}
      }

      const leftSame : boolean = compareWhole(redex, userRedex)

      if ( ! leftSame) {
        return { valid : false, errors : [ `Left side of redex is not same.` ] }
      }

      return { valid : true }
    }
    case 'not-same-as-old' : {
      if (compareWhole(old, user)) {
        return { valid : false, errors : [ `Old and user trees are same.` ]}
      }
      return { valid : true }
    }
    case 'beta-redex-right-side-beta-reduced' : {
      let redex : Binary | null = betaRedex(old) as Binary
      if (redex === null) {
        return { valid : false, errors : [ `I cannot find beta redex because next reduction is not beta` ] }
      }

      const userRedex : Binary | null = getEquivalent(correct, user, redexSymbol(redex)) as Binary

      if (userRedex === null) {
        return { valid : false, errors : [ `I cannot find user redex equivalent.` ]}
      }

      // reduce redex.right side
      // user may be already reduced

      const tree : AST = reduceApplicative((redex as Binary))

      const rightSame : boolean = compareWhole(tree, userRedex)

      if ( ! rightSame) {
        return { valid : false, errors : [ `Right side of redex does not appear to be reduced correctly.` ] }
      }

      return { valid : true }
    }
    case 'argument-substituted-but-unremoved' : {
      const norm : NormalEvaluator = new NormalEvaluator(old)
      if (!(norm.nextReduction instanceof Beta)) {

        return { valid : false, errors : [ `I cannot find beta redex because next reduction is not beta` ] }
      }
      
      const userNorm : NormalEvaluator = new NormalEvaluator(user)
      if (!(userNorm.nextReduction instanceof Beta)) {
        return { valid : false, errors : [ `I cannot find beta redex because next reduction is not beta` ] }
      }

      const userLeft : AST = userNorm.perform()
      const left : AST = norm.perform()

      if (norm.nextReduction.parent === null
        || norm.nextReduction.treeSide === null) {
        if (norm.nextReduction.argName === userNorm.nextReduction.argName
          &&
            compareWhole(left, userLeft)
          ) {
            return { valid : true }
          }
          console.log('BAD')
        return { valid : false, errors : [ `I cannot find beta redex because next reduction is not beta` ] }
      }

      // const next : AST = norm.perform()

      if (norm.nextReduction.argName === userNorm.nextReduction.argName
            &&
          compareWhole(left, userLeft)
        ) {
          return { valid : true }
        }



      if ( ! compareWhole(norm.nextReduction.parent[norm.nextReduction.treeSide], userLeft)) {
        console.log('BAAAAAAAD')
        return { valid : false, errors : [ `Does not appear to be case of unremoved but substituted arg.` ] }
      }

      return { valid : true }
    }
    case 'same-or-equivalent-from-beta-redex' : {
      let redex : Binary | null = betaRedex(old) as Binary
      if (redex === null) {
        return { valid : true, errors : [ `I cannot find beta redex because next reduction is not beta` ] }
      }

      const userRedex : Binary | null = getEquivalent(correct, user, redexSymbol(redex)) as Binary

      if (userRedex === null) {
        return { valid : false, errors : [ `I cannot find user redex equivalent.` ]}
      }

      if ( ! compareWhole(redex.left, userRedex.left)) {
        return { valid : false, errors : [ `Left child of beta redex is not same` ] }
      }

      if ( ! compareWhole(redex.right, userRedex.right)) {
        return { valid : false, errors : [ `Right child of beta redex is not same` ] }
      }

      return { valid : true }
    }
    case 'beta-wrong-argument' : {
      // TODO: zjistit jestli misto prvniho argumentu nedosazoval za jinej argument

      return { valid : false }
    }
    case 'correct-double-step-alpha-beta' : {
      let normal : NormalEvaluator = new NormalEvaluator(old)

      if (! (normal.nextReduction instanceof Alpha)) {
        return { valid : false, errors : [ `First step was not Alpha Conversion.` ]}
      }

      normal = new NormalEvaluator(correct)

      if (! (normal.nextReduction instanceof Beta)) {
        return { valid : false, errors : [ `Second step was not Beta Reduction.` ]}
      }

      const ref : AST = normal.perform()

      if ( ! compareWhole(ref, user)) {
        return { valid : false, errors : [ `User tree does not correspond to double step Alpha+Beta.` ] }
      }

      return { valid : true }
    }
    case 'incorrect-double-step-alpha-beta' : {
      let normal : NormalEvaluator = new NormalEvaluator(old)

      if (! (normal.nextReduction instanceof Alpha)) {
        return { valid : false, errors : [ `First step was not Alpha Conversion.` ]}
      }

      normal = new NormalEvaluator(correct)

      if (! (normal.nextReduction instanceof Beta)) {
        return { valid : false, errors : [ `Second step was not Beta Reduction.` ]}
      }

      const ref : AST = normal.perform()

      if ( ! compareWhole(ref, user)) {
        return { valid : true }
      }

      return { valid : true, errors : [ `This is valid double step Alpha+Beta` ] }
    }
    case 'macro-expression-equivalent' : {
      // TODO: tam kde se to lisi jen v makru
      // expadovat to makro na strane moji nebo uzivatele
      // porovnat pak

      // nebo napsat porovnavaci funkci,
      // ktera rovnou kdyz narazi na jedne strane na Macro a na druhe na cokoliv
      // provede expanzi toho makra a porovna
      // to bude jednodussi

      return { valid : false }
    }
    case 'id-misstype' : {
      // TODO: je chyba ve jmenu promenne, makra, cisla?
      // je editacni vzdalenost rekneme do 2 znaku?
      // pak je to preklep!

      return { valid : false }
    }
    case 'should-do-alpha' : {
      let normal : NormalEvaluator = new NormalEvaluator(old)

      if (! (normal.nextReduction instanceof Alpha)) {
        return { valid : false, errors : [ `First step was not Alpha Conversion.` ]}
      }

      return { valid : true }
    }
    case 'redex-left-side-beta-reduced' : {
      // TODO: kdyz provedu beta redukci nad starym stromem
      // bude to vypada jako uzivateluv strom?

      return { valid : false }
    }
    default : {
      console.log('I CANT FIGURE OUT THIS')
      console.log(predicate)
      return { valid : false, errors : [ `I can't figure out what exactly you did wrong` ] }
    }
  }
}

const contradicts = (answer : any, rule : any) =>
  (answer.valid === false && rule.type === 'con')

export function expert (old : AST, current : AST, user : AST) {
  // console.log(Object.values(rules), '---------------')
  let rules_list = (Object as any).fromEntries([ ...rules ].map(({ name }) => [ name, [] ]))
  const rules_list__g = (Object as any).fromEntries([ ...rules ].map(({ name }) => [ name, [] ]))

  const infer = (rules : Array<any>) => {
    rules:
    for (const rule of rules) {
      const { name, predicates } = rule
      if (! (name in rules_list)) {
        continue rules
      }


      predicates:
      for (const predicate of predicates) {
        // console.log('PREDICATE :  ' + predicate)
        // TODO: nez se zeptam "usera" zjistim,
        // jestli predikat neni jmeno nejakeho dalsiho pravidla
        // pokud je to pravidlo, musim ho overit -> i rekurzivne
        if (rules.find(({name}) => predicate === name) !== undefined
        && !(predicate in rules_list)) {
          delete rules_list[name]
          continue rules
        }

        if (predicate in rules_list) {
          infer([rules__g.find(({name}) => name === predicate )])

          if (predicate in rules_list) {
            // TODO if it is STILL in rules_list and was not removed
            console.log([ rules_list[name], rules_list[predicate] ], '0')
            rules_list[name] = [ ...rules_list[name],  ...rules_list[predicate] ]
            continue
          }
          if (contradicts({valid:false}, rule)) {
            delete rules_list[name]
            continue rules
          }
          continue
        } else if (predicate in rules_list__g) {
          console.log('PREDICATE which was disproven found', predicate,
          'cheching if it contradicts and sorting things out')
          if (contradicts({valid:false}, rule)) {
            delete rules_list[name]
            continue rules
          }
          continue
        }


        const answer = verify(predicate, old.clone(), current.clone(), user.clone())
  
        if (contradicts(answer, rule)) {
          delete rules_list[name]
          continue rules
        }
        // TODO: uncomment
        if ( ! answer.valid) {
          continue
        }

        console.log([ rules_list[name] ], '1')
        console.log(name)
  
        rules_list[name] = [ answer , ...rules_list[name] ]
      }
    }
  }

  infer(rules)

  return (Object as any).fromEntries(Object.entries<Array<string>>(rules_list).filter(([key, value]) => value.length !== 0))
}