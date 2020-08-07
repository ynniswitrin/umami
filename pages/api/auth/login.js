import { serialize } from 'cookie';
import { checkPassword, createSecureToken } from 'lib/crypto';
import { getAccount } from 'lib/db';
import { AUTH_COOKIE_NAME } from 'lib/constants';

export default async (req, res) => {
  const { username, password } = req.body;

  const account = await getAccount(username);

  if (account && (await checkPassword(password, account.password))) {
    const { user_id, username, is_admin } = account;
    const token = await createSecureToken({ user_id, username, is_admin });
    const cookie = serialize(AUTH_COOKIE_NAME, token, {
      path: '/',
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 365,
    });

    res.setHeader('Set-Cookie', [cookie]);

    return res.status(200).json({ token });
  }

  return res.status(401).end();
};