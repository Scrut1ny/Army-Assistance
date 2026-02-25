(function () {
    const root = document.querySelector('[x-data="speedMission"]');
    const state = root?._x_dataStack?.[0];
    if (!state?.sm?.qs?.length) return;

    state.sm.qs.forEach(q => {
        state.answer = q.a;
        state.submitSm();
    });
})();
