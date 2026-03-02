// unstable_cache をテスト環境でパススルーとして振る舞わせるスタブ。
// Next.jsランタイムが存在しないVitest環境でも、通知データの読み書きロジックを
// キャッシュ層なしで直接テストできるようにする。
export function unstable_cache<T extends (...args: never[]) => unknown>(fn: T): T {
  return fn;
}

export function revalidatePath(): void {}
export function revalidateTag(): void {}
