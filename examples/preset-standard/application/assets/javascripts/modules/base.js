function base(prop = {}) {
  const { msg, ...rest } = prop;
  console.log(msg, {
    ...rest,
    production: false,
  });
}

base({ msg: 'base', demo: true });
