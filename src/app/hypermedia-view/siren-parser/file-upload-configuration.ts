export class FileUploadConfiguration {
  /// <summary>
  /// Max size of a single file in bytes the server will accept.
  /// -1 indicating no limit.
  /// </summary>
  public MaxFileSizeBytes: number = -1;


  /// <summary>
  /// Indicates if it is allowed to send multiple files.
  /// </summary>
  public AllowMultiple: boolean = false;

  /// <summary>
  /// Defines the file types the file input should accept as unique file type specifiers.
  /// Examples:
  /// <list type="bullet">
  /// <item><description>case-insensitive filename extension, starting with a period ("."). E.g.: '.png'</description></item>
  /// <item><description>A valid MIME type string, with no extensions. E.g.: 'text/html'</description></item>
  /// <item><description>Media wildcard. E.g.: 'image/*', 'audio/*', 'video/*'</description></item>
  /// </list>
  /// Default is empty indicating no limitation.
  /// </summary>
  public Accept: string[] = []

  public getAcceptString():string {
    return this.Accept.join(",");
  }
}
