// function $DeclareStringUnionWithRuntimeArray(...Strings: Array<string>)
// {
//     +[[Strings], (String: string) =>
//     {
//         $$ts!(`
//             const RuntimeArray: Array<string> = 
//             class ${classInfo.name} {
//                 constructor() {
//                     this.value = ${classInfo.value}
//                 }
//             }
//         `);
//     }];
// }

// class FReflectionManager
// {
//     private constructor() { }

//     private Instance?: FReflectionManager;

//     public Get(): FReflectionManager
//     {
//         if (this.Instance === undefined)
//         {
//             this.Instance = new FReflectionManager();
//         } 

//         return this.Instance;
//     }

//     public 
// }
