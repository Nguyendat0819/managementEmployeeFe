import { computed, inject, Injectable, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { SsBreadcrumbItem, SsBreadcrumbService } from '@platform/ui-kit';
import { MenuService } from '../menu/menu.service';
import { MenuItem } from '../menu/menu-item.model';

/** Một node menu có url, kèm sẵn chuỗi tổ tiên để khỏi phải truy ngược lúc khớp. */
interface IndexedNode {
  fullPath: string;
  chain: SsBreadcrumbItem[];
}

/**
 * Dựng breadcrumb. Chỉ có HAI đường, không có đường thứ ba:
 *
 *  1. TỰ ĐỘNG (mặc định, màn hình không viết gì)
 *     = phân cấp theo cây menu  +  mã bản ghi trên URL nếu có.
 *
 *     Phân cấp lấy từ menu chứ không từ router, vì nhóm menu như "Quản trị hệ thống"
 *     không có route riêng — đi dọc ActivatedRoute sẽ không bao giờ ra được nó.
 *
 *     "Mã nếu có" = ĐOẠN URL ĐẦU TIÊN nằm ngoài nhánh menu. Chỉ một đoạn, không phải
 *     tất cả: '/admin/roles/USERS/access' cho ra '... › Vai trò nhân viên › USERS'.
 *     KHÔNG dịch, KHÔNG có từ điển nhãn — đoán nghĩa đoạn URL là hard-code trá hình,
 *     mỗi màn mới lại phải sửa Shell. Muốn nhãn khác thì màn hình tự đặt (đường 2).
 *
 *  2. GHI ĐÈ (màn hình chủ động)
 *     SsBreadcrumbService.setTail() / setLast() / setAll().
 *     setAll bỏ qua luôn cây menu, dùng cho màn không có trong menu.
 */
@Injectable({ providedIn: 'root' })
export class BreadcrumbBuilderService {
  private readonly router = inject(Router);
  private readonly menuService = inject(MenuService);
  private readonly manual = inject(SsBreadcrumbService);

  private readonly url = signal<string>('/');

  constructor() {
    this.url.set(this.router.url);
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => {
        // Reset TRƯỚC khi đổi url, nếu không breadcrumb của màn cũ dính sang màn mới
        // trong một nhịp render.
        this.manual.reset();
        this.url.set(e.urlAfterRedirects);
      });
  }

  readonly crumbs = computed<SsBreadcrumbItem[]>(() => {
    const override = this.manual.override();
    if (override?.mode === 'all') return seal(override.items);

    const path = normalize(this.url());
    const hit = matchMenu(this.menuService.getMenu(), path);
    const head = hit?.chain ?? [];

    // Đuôi: màn hình đặt thì dùng, không thì lấy ĐÚNG MỘT đoạn URL đầu tiên ngoài menu.
    const tail =
      override?.mode === 'tail'
        ? override.items
        : firstExtraSegment(hit ? path.slice(hit.fullPath.length) : '');

    return seal([...head, ...tail]);
  });
}

/** Cấp cuối là trang đang đứng -> bỏ path để không bấm được, dù nguồn nào có gán. */
function seal(items: SsBreadcrumbItem[]): SsBreadcrumbItem[] {
  if (!items.length) return items;
  const out = [...items];
  out[out.length - 1] = { label: out[out.length - 1].label };
  return out;
}

/** '/USERS/access' -> [{ label: 'USERS' }]. Rỗng -> []. Giữ nguyên văn, không dịch. */
function firstExtraSegment(rest: string): SsBreadcrumbItem[] {
  const seg = rest.split('/').filter(Boolean)[0];
  return seg ? [{ label: safeDecode(seg) }] : [];
}

/**
 * Khớp tiền tố DÀI NHẤT. Bắt buộc phải dài nhất: với '/digitization/requests/YC-001'
 * thì cả '/digitization' lẫn '/digitization/requests' đều khớp, phải chọn cái sau.
 *
 * KHÔNG lọc node.hidden: đang đứng ở trang nào thì phải có breadcrumb của trang đó,
 * kể cả trang không hiện trên menu. Lọc ở đây còn tạo kiểu hỏng rất khó tìm — sidebar
 * không lọc hidden nên vẫn đầy đủ, chỉ riêng breadcrumb trống trơn.
 */
function matchMenu(menu: MenuItem[], path: string): IndexedNode | undefined {
  let best: IndexedNode | undefined;

  const walk = (nodes: MenuItem[], chain: SsBreadcrumbItem[]): void => {
    for (const node of nodes) {
      const full = node.path ? normalize(node.path) : null;
      const nextChain = [...chain, { label: node.label, path: full ?? undefined }];

      if (full && (path === full || path.startsWith(full + '/'))) {
        if (!best || full.length > best.fullPath.length) best = { fullPath: full, chain: nextChain };
      }
      if (node.children?.length) walk(node.children, nextChain);
    }
  };

  walk(menu, []);
  return best;
}

/** Bỏ query, hash, dấu / thừa cuối để hai bên so sánh cùng một dạng. */
function normalize(url: string): string {
  const clean = url.split('?')[0].split('#')[0].replace(/\/+$/, '');
  return clean.startsWith('/') ? clean : '/' + clean;
}

/** URL có thể chứa ký tự đã mã hoá; decode hỏng thì trả nguyên bản còn hơn ném lỗi. */
function safeDecode(seg: string): string {
  try {
    return decodeURIComponent(seg);
  } catch {
    return seg;
  }
}
