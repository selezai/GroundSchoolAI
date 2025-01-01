export class MockStorage {
  private files: Map<string, any>;

  constructor() {
    this.files = new Map();
  }

  from(bucket: string) {
    return {
      upload: async (path: string, data: any) => {
        this.files.set(`${bucket}/${path}`, data);
        return { data: { path }, error: null };
      },
      createSignedUrl: async (path: string, expiresIn: number) => {
        return { data: { signedUrl: `mock-signed-url/${path}` }, error: null };
      },
      remove: async (paths: string[]) => {
        paths.forEach(path => this.files.delete(`${bucket}/${path}`));
        return { data: { paths }, error: null };
      },
    };
  }
}

export const mockStorage = new MockStorage();
