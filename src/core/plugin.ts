/** Module-augmentable map of plugin services available on context */
export interface Services {}

/** Describes a named plugin that builds a service instance for dependency injection */
export interface Plugin {
  name: string
  build(): unknown
}
