# Work Mode

This file defines how AI contributors interpret user intent.

## Human Shortcut

The human only needs to remember:

```text
reia = spune-mi unde suntem
investigheaza = nu modifica
continua = lucreaza
comite = inchide curat
```

## Modes

| Mode | Human language | Agent behavior |
| --- | --- | --- |
| Resume / Reia | `reia`, `resume`, `unde eram?` | Read handoff state and report status. No edits. |
| Investigation only | `analizeaza fara cod`, `nu implementa` | Read and analyze only. No mutations. |
| Continue / Implement | `continua`, `implementeaza`, `rezolva` | Implement within active scope and verify. |
| Closeout / Commit | `comite`, `inchide sesiunea`, `pregateste handoff` | Update handoff docs, run Banana Loop and Constitutional Check. |

## Default Behavior

If the user asks for a concrete change and does not restrict editing, implement it.

If the user asks for understanding, comparison, architecture discussion, or investigation, do not edit unless they explicitly ask.

If the user mixes discussion and implementation, prefer a small documented foundation first, then continue with scoped implementation.

## Workspace Note

Current workspace status: this folder is initialized as a Git repository on `main`, with remote `origin` set to `https://github.com/cata009/mobile-banking-cee.git`.
