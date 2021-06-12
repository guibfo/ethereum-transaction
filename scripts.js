(async () => {
  const NODE_URL = 'https://mainnet.infura.io/v3/a78f30e7a884487eae31946abdc18e95';
  const FEE_FIXED_VALUE = 500000;
  const balance = document.getElementById('balance');
  const amount = document.getElementById('amount');
  const fee = document.getElementById('fee');
  const form = document.getElementById('form');
  const toAddress = document.getElementById('to');
  const submitButton = document.querySelector('.submit');
  const balanceInUSD = balance.nextElementSibling.querySelector('.value');
  const amountInUSD = amount.nextElementSibling.querySelector('.value');
  const feeInUSD = fee.nextElementSibling.querySelector('.value');
  const provider = new ethers.providers.JsonRpcProvider(NODE_URL);
  const gasPrice = await provider.getGasPrice();

  const getConversionRate = async () => {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
    const { ethereum: { usd } } = await response.json();
    return usd;
  };

  const conversionRate = await getConversionRate();

  const getFeeCut = amount => {
    if (amount >= 0 && amount < 0.01) {
      return 0.005;
    }

    if (amount >= 0.01 && amount < 0.25) {
      return 0.007;
    }

    if (amount >= 0.25 && amount < 5) {
      return 0.01;
    }

    if (amount >= 5 && amount < 30) {
      return 0.015;
    }

    if (amount >= 30 && amount < 150) {
      return 0.02;
    }

    return 0.03;
  };

  const calculateFee = amount => {
    const feeCut = getFeeCut(amount);
    const gas = FEE_FIXED_VALUE * amount * (0.01 + feeCut);
    const weiPrice = gasPrice.toNumber() * gas;
    return weiPrice/10**18;
  };

  form.addEventListener('blur', ({ target : { name, value, id } }) => {
    if (name === 'to') {
      if (!value.match(/^0x[a-fA-F0-9]{40}$/)) {
        document.getElementById(id).classList.add('error');
      } else {
        document.getElementById(id).classList.remove('error');
      }
    }

    if (name === 'amount') {
      if (value < 0 || parseFloat(balance.value) < parseFloat(value) + parseFloat(fee.value)) {
        document.getElementById(id).classList.add('error');
      } else {
        document.getElementById(id).classList.remove('error');
      }
    }
    isFormValid();
  }, true);

  const isFormValid = () => {
    if (amount.value && toAddress.value && !document.querySelector('.error')) {
      submitButton.disabled = false;
      return
    }
    submitButton.disabled = true;
  };

  form.addEventListener('keyup', ({ target : { name, value, id } }) => {
    if (name === 'amount') {
      if (value === '') {
        amountInUSD.innerHTML = 0;
        feeInUSD.innerHTML = 0;
        fee.value = 0;
        isFormValid();
        return;
      }

      const currentFee = calculateFee(value);

      amountInUSD.innerHTML = parseFloat((parseFloat(value) * conversionRate).toFixed(2));
      feeInUSD.innerHTML = parseFloat((parseFloat(currentFee) * conversionRate).toFixed(2));;
      fee.value = currentFee;

      if (parseFloat(balance.value) < parseFloat(value) + parseFloat(fee.value)) {
        document.getElementById(id).classList.add('error');
      } else {
        document.getElementById(id).classList.remove('error');
      }
    }
    isFormValid();
  }, true);

  balanceInUSD.innerHTML = (parseFloat(balance.value) * conversionRate).toFixed(2);
})();