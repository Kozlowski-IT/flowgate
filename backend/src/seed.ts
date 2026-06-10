import * as bcrypt from 'bcrypt';
import dataSource from './data-source';
import { Role } from './users/domain/value-objects/role';
import { UserOrmEntity } from './users/infrastructure/persistence/user.orm-entity';

const DEMO_USERS: Array<{ email: string; role: Role }> = [
  { email: 'admin@flowgate.demo', role: Role.Admin },
  { email: 'reviewer@flowgate.demo', role: Role.Reviewer },
  { email: 'requester@flowgate.demo', role: Role.Requester },
];

async function seed(): Promise<void> {
  await dataSource.initialize();
  const repo = dataSource.getRepository(UserOrmEntity);
  const password = process.env.SEED_PASSWORD ?? 'Demo1234!';
  const passwordHash = await bcrypt.hash(password, 10);

  for (const { email, role } of DEMO_USERS) {
    if (await repo.existsBy({ email })) {
      console.log(`skip (exists): ${email}`);
      continue;
    }
    await repo.save(repo.create({ email, passwordHash, role }));
    console.log(`created: ${email} (${role})`);
  }
  await dataSource.destroy();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
