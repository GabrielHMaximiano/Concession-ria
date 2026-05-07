import java.util.ArrayList;
import java.util.List;

public class CarroRepository {
    private final List<Carro> carros = new ArrayList<>();

    public void criar(Carro carro) {
        carros.add(carro);
    }

    public List<Carro> listar() {
        return new ArrayList<>(carros);
    }

    public Carro buscarPorId(int id) {
        for (Carro carro : carros) {
            if (carro.getId() == id) {
                return carro;
            }
        }
        return null;
    }

    public boolean atualizar(int id, String marca, String modelo, int ano, double preco) {
        Carro carro = buscarPorId(id);
        if (carro == null) {
            return false;
        }
        carro.setMarca(marca);
        carro.setModelo(modelo);
        carro.setAno(ano);
        carro.setPreco(preco);
        return true;
    }

    public boolean deletar(int id) {
        Carro carro = buscarPorId(id);
        if (carro == null) {
            return false;
        }
        carros.remove(carro);
        return true;
    }
}
