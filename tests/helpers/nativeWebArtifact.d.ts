/** Public ABI of the generated, isolated Native Web entry consumed by integration tests. */
declare module '*native-spike/dist-host/current-host.js' {
  export const version: 1
  export const mountCurrentApplication: import('@/features/demo-native/contracts').NativeDemoModule['mountCurrentApplication']
}
