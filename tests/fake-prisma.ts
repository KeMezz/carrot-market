type Row = Record<string, any>;

// where 절(스칼라 일치, lt, OR, product 관계)을 실제로 평가하는 최소한의 인메모리 Prisma 모델
export function createFakePrisma() {
  const db = {
    users: [] as Row[],
    tokens: [] as Row[],
    products: [] as Row[],
    chatRooms: [] as Row[],
    chatMessages: [] as Row[],
    nextId: 1000,
  };

  const matches = (row: Row, where: Row = {}): boolean =>
    Object.entries(where).every(([key, cond]) => {
      if (cond === undefined) return true;
      if (key === "OR") return (cond as Row[]).some((c) => matches(row, c));
      if (key === "product") {
        const product = db.products.find((p) => p.id === row.productId);
        return !!product && matches(product, cond);
      }
      if (cond && typeof cond === "object" && !(cond instanceof Date)) {
        if ("lt" in cond) return row[key] < cond.lt;
        throw new Error(`unsupported condition on ${key}`);
      }
      return row[key] === cond;
    });

  const sorted = (rows: Row[], orderBy?: Row) => {
    if (!orderBy) return rows;
    const [[key, dir]] = Object.entries(orderBy);
    return [...rows].sort((a, b) =>
      dir === "desc" ? b[key] - a[key] : a[key] - b[key]
    );
  };

  const client = {
    user: {
      async upsert({ where, create }: Row) {
        let user = db.users.find((u) => matches(u, where));
        if (!user) {
          user = { id: db.nextId++, ...create };
          db.users.push(user);
        }
        return { id: user.id };
      },
    },
    token: {
      async create({ data }: Row) {
        if (db.tokens.some((t) => t.payload === data.payload)) {
          throw Object.assign(new Error("unique"), { code: "P2002" });
        }
        const token = {
          id: db.nextId++,
          attempts: 0,
          createdAt: new Date(),
          ...data,
        };
        db.tokens.push(token);
        return token;
      },
      async findFirst({ where, orderBy }: Row) {
        return sorted(db.tokens.filter((t) => matches(t, where)), orderBy)[0] ?? null;
      },
      async findMany({ where, orderBy }: Row) {
        return sorted(db.tokens.filter((t) => matches(t, where)), orderBy);
      },
      async updateMany({ where, data }: Row) {
        const targets = db.tokens.filter((t) => matches(t, where));
        targets.forEach((t) => {
          for (const [key, value] of Object.entries(data) as [string, any][]) {
            t[key] = value && value.increment ? t[key] + value.increment : value;
          }
        });
        return { count: targets.length };
      },
      async deleteMany({ where }: Row) {
        const before = db.tokens.length;
        db.tokens = db.tokens.filter((t) => !matches(t, where));
        return { count: before - db.tokens.length };
      },
    },
    chatRoom: {
      async findFirst({ where }: Row) {
        const room = db.chatRooms.find((r) => matches(r, where));
        if (!room) return null;
        const product = db.products.find((p) => p.id === room.productId)!;
        const owner = db.users.find((u) => u.id === product.userId)!;
        return {
          product: {
            id: product.id,
            name: product.name,
            user: { id: owner.id, name: owner.name },
          },
        };
      },
    },
    chatMessage: {
      async findMany({ where }: Row) {
        return db.chatMessages
          .filter((m) => matches(m, where))
          .map((m) => ({
            id: m.id,
            message: m.message,
            user: { id: m.userId, avatar: null },
          }));
      },
      async create({ data }: Row) {
        const message = {
          id: db.nextId++,
          message: data.message,
          userId: data.user.connect.id,
          chatRoomId: data.chatRoom.connect.id,
        };
        db.chatMessages.push(message);
        return message;
      },
    },
  };

  return { db, client };
}

export function createRes() {
  const res: any = {
    statusCode: 200,
    body: undefined as any,
    status(code: number) {
      res.statusCode = code;
      return res;
    },
    json(body: any) {
      res.body = body;
      return res;
    },
    end() {
      return res;
    },
  };
  return res;
}

export function createReq(init: {
  method?: string;
  body?: any;
  query?: Record<string, any>;
  session?: Row;
}) {
  const session: Row = { ...(init.session ?? {}) };
  session.save = async () => {};
  return {
    method: init.method ?? "POST",
    body: init.body,
    query: init.query ?? {},
    session,
  } as any;
}
