function base(prop = {}) {
  const { msg, ...rest } = prop;
  // eslint-disable-next-line no-console
  console.log(msg, {
    ...rest,
    production: false,
  });
}

base({ msg: 'base', demo: true });
