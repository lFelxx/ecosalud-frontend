/// <reference types="vitest/globals" />

import { render } from '@testing-library/react';
import { MemoryRouter, Routes, Route, Link } from 'react-router-dom';
import { act } from '@testing-library/react';
import ScrollToTop from '../../../presentation/components/common/ScrollToTop';

// window.scrollTo ya está mockeado en setup.ts como vi.fn()

describe('ScrollToTop — renderizado y comportamiento', () => {
  beforeEach(() => {
    vi.mocked(window.scrollTo).mockClear();
  });

  it('renderiza null (no produce nodos en el DOM)', () => {
    const { container } = render(
      <MemoryRouter>
        <ScrollToTop />
      </MemoryRouter>
    );
    expect(container.firstChild).toBeNull();
  });

  it('llama a window.scrollTo al inicio (navegación PUSH inicial)', () => {
    render(
      <MemoryRouter initialEntries={['/inicio']}>
        <ScrollToTop />
      </MemoryRouter>
    );
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'instant' });
  });

  it('registra y desregistra el listener de scroll al montar/desmontar', () => {
    const addSpy = vi.spyOn(window, 'addEventListener');
    const removeSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = render(
      <MemoryRouter>
        <ScrollToTop />
      </MemoryRouter>
    );

    expect(addSpy).toHaveBeenCalledWith('scroll', expect.any(Function), { passive: true });

    unmount();

    expect(removeSpy).toHaveBeenCalledWith('scroll', expect.any(Function));

    addSpy.mockRestore();
    removeSpy.mockRestore();
  });

  it('vuelve al inicio al navegar a una ruta nueva (PUSH)', async () => {
    // Usamos un Link para simular una navegación PUSH y que ScrollToTop reaccione
    function TestApp() {
      return (
        <MemoryRouter initialEntries={['/']}>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Link to="/otra">Ir a otra</Link>} />
            <Route path="/otra" element={<div>Otra página</div>} />
          </Routes>
        </MemoryRouter>
      );
    }

    const { getByText } = render(<TestApp />);

    vi.mocked(window.scrollTo).mockClear();

    await act(async () => {
      getByText('Ir a otra').click();
    });

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'instant' });
  });
});
