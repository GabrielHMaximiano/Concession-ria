import java.util.List;
import java.util.Scanner;

public class Main {
    private static final Scanner scanner = new Scanner(System.in);
    private static final CarroRepository repository = new CarroRepository();

    public static void main(String[] args) {
        int opcao;
        do {
            mostrarMenu();
            opcao = lerInteiro("Escolha uma opção: ");

            switch (opcao) {
                case 1:
                    criarCarro();
                    break;
                case 2:
                    listarCarros();
                    break;
                case 3:
                    atualizarCarro();
                    break;
                case 4:
                    deletarCarro();
                    break;
                case 0:
                    System.out.println("Saindo...");
                    break;
                default:
                    System.out.println("Opção inválida.");
            }
        } while (opcao != 0);
    }

    private static void mostrarMenu() {
        System.out.println("\n=== CRUD Concessionária ===");
        System.out.println("1 - Criar carro");
        System.out.println("2 - Listar carros");
        System.out.println("3 - Atualizar carro");
        System.out.println("4 - Deletar carro");
        System.out.println("0 - Sair");
    }

    private static void criarCarro() {
        int id = lerInteiro("ID: ");
        String marca = lerTexto("Marca: ");
        String modelo = lerTexto("Modelo: ");
        int ano = lerInteiro("Ano: ");
        double preco = lerDouble("Preço: ");

        Carro carro = new Carro(id, marca, modelo, ano, preco);
        repository.criar(carro);
        System.out.println("Carro criado com sucesso.");
    }

    private static void listarCarros() {
        List<Carro> carros = repository.listar();
        if (carros.isEmpty()) {
            System.out.println("Nenhum carro cadastrado.");
            return;
        }

        System.out.println("\n--- Lista de Carros ---");
        for (Carro carro : carros) {
            System.out.println(carro);
        }
    }

    private static void atualizarCarro() {
        int id = lerInteiro("ID do carro para atualizar: ");
        String marca = lerTexto("Nova marca: ");
        String modelo = lerTexto("Novo modelo: ");
        int ano = lerInteiro("Novo ano: ");
        double preco = lerDouble("Novo preço: ");

        boolean atualizado = repository.atualizar(id, marca, modelo, ano, preco);
        if (atualizado) {
            System.out.println("Carro atualizado com sucesso.");
        } else {
            System.out.println("Carro não encontrado.");
        }
    }

    private static void deletarCarro() {
        int id = lerInteiro("ID do carro para deletar: ");
        boolean deletado = repository.deletar(id);
        if (deletado) {
            System.out.println("Carro deletado com sucesso.");
        } else {
            System.out.println("Carro não encontrado.");
        }
    }

    private static int lerInteiro(String mensagem) {
        System.out.print(mensagem);
        while (!scanner.hasNextInt()) {
            System.out.print("Valor inválido. Digite um número inteiro: ");
            scanner.next();
        }
        int valor = scanner.nextInt();
        scanner.nextLine();
        return valor;
    }

    private static double lerDouble(String mensagem) {
        System.out.print(mensagem);
        while (!scanner.hasNextDouble()) {
            System.out.print("Valor inválido. Digite um número decimal: ");
            scanner.next();
        }
        double valor = scanner.nextDouble();
        scanner.nextLine();
        return valor;
    }

    private static String lerTexto(String mensagem) {
        System.out.print(mensagem);
        return scanner.nextLine();
    }
}
