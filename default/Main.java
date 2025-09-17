import java.util.Scanner;

public class Main{
    public static String[] name_play(){
        Scanner sc = new Scanner(System.in);
        String[] l = new String[2];
        Boolean n1_valid = true , n2_valid = true;
        String n1 = "", n2 = "";

        while(n1_valid){
            System.out.print("Nome do jogador 1: ");
            n1 = sc.nextLine();
            n1_valid = false;
            for(int i = 0; i != n1.length(); i++){
                char s = n1.charAt(i);
                if(s == '0' || s == '1' || s == '2' || s == '3' || s == '4' || s == '5' || s == '6' || s == '7' || s == '8' || s == '9'){
                    n1_valid = true;
                }
            }  
        }

        while(n2_valid){
            System.out.print("Nome do jogador 2: ");
            n2 = sc.nextLine();
            n2_valid = false;
            for(int i = 0; i != n2.length(); i++){
                char s = n2.charAt(i);
                if(s == '0' || s == '1' || s == '2' || s == '3' || s == '4' || s == '5' || s == '6' || s == '7' || s == '8' || s == '9'){
                    n2_valid = true;
                }
            }
        }

        l[0] = n1;
        l[1] = n2;
        return l;
    }

    public static int menu(){
        Scanner sc = new Scanner(System.in);

        System.out.println("[1]Iniciar jogo");
        System.out.println("[2]Mudar jogadores");
        System.out.println("[3]Sair do jogo");
        int X = sc.nextInt();
        
        return X;   
    }

    public static boolean win(String[][] s){
        
        for(int i = 0; i != 3; i++){
            if((s[i][0] == "O" && s[i][1] == "O" && s[i][2] == "O") || (s[i][0] == "X" && s[i][1] == "X" && s[i][2] == "X")){
                return false;
            }
        }for(int i = 0; i != 3; i++){
            if((s[0][i] == "O" && s[1][i] == "O" && s[2][i] == "O") || (s[0][i] == "X" && s[1][i] == "X" && s[2][i] == "X")){
                return false;
            }
        }
        if((s[0][0] == "O" && s[1][1] == "O" && s[2][2] == "O") || (s[0][0] == "X" && s[1][1] == "X" && s[2][2] == "X")){
            return false;
        }else if((s[0][2] == "O" && s[1][1] == "O" && s[2][0] == "O") || (s[0][2] == "X" && s[1][1] == "X" && s[2][0] == "X")){
            return false;
        }else{
            return true;
        }
    }

    public static int ln(Integer X){
        int line;
        if(X >= 7 ){
            line = 0;
        }else if(X >= 4 && X <= 6){
            line = 1;
        }else{
            line = 2;
        }   

        return line;
    }

    public static int cln(Integer X){
        int column;
        if(X == 7 || X == 4 || X == 1){
            column = 0;
        }else if(X == 8 || X == 5 || X == 2){
            column = 1;
        }else{
            column = 2;
        }

        return column;
    }

    public static String player(Integer X){
        if(X % 2 == 0){
            return "X";
        }else{
            return "O";
        }
    }
    public static void PrintMatriz(String[][] board){
        int line = 0;
        int column = 0;

        for(int i = 0; i != 9; i++){
            if(column == 3){
                line += 1;
                column = 0;
            }

            if(board[line][column] == null){
                board[line][column] = " ";
            }

            column++;   
        }

        System.out.println(board[0][0]+"|"+board[0][01]+"|"+board[0][2]);
        System.out.println("-----");
        System.out.println(board[1][0]+"|"+board[1][01]+"|"+board[1][2]);
        System.out.println("-----");
        System.out.println(board[2][0]+"|"+board[2][01]+"|"+board[2][2]+"\n");
    }
    
    public static void play_win(int player, Boolean win_tie, String[] l_name){
        if(player == 1 && win_tie == false){
            System.out.println("Jogador "+l_name[0]+" venceu!");
        }else if(player % 2 == 0 && win_tie == false){
            System.out.println("Jogador "+l_name[1]+" venceu!");
        }else{
            System.out.println("Empate.");
        }
    }
    
    public static String[][] delet_matriz(String[][] s){
        for(int i = 0; i != 3; i++){
            s[0][i] = null; 
            s[1][i] = null;
            s[2][i] = null;
        }
        return s;
    }

    public static Integer[] delet_list(Integer[] l){
        for(int i = 0; i != 9; i++){
            l[i] = null;
        }
        return l;
    }
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String[][] s = new String[3][3];
        int cont;
        Integer[] l_position = new Integer[9];
        String[] l_name = new String[2];
        
        l_name = name_play();

        while(true){
            int menu_answer = menu();

            if(menu_answer == 1){
                cont = 0;
                while(cont != 9 && win(s) == true){
                    System.out.print("Jogador "+ l_name[cont % 2] +" digite a procissão: ");
                    int N = sc.nextInt();
                    boolean verific = true;
    
                    for(int i = 0; i < 9; i++){
                        if((l_position[i] != null && l_position[i] == N) || N > 9 || N < 1){
                            verific = false;
                        }
                    }
    
                    l_position[cont] = N;
                    if(verific){
                        s[ln(N)][cln(N)] = player(cont);
                        PrintMatriz(s);
                        cont++;
                    }else{
                        System.out.println("Valor invalido.");
                    }
                }

                play_win(cont % 2, win(s), l_name);
                s = delet_matriz(s);
                l_position = delet_list(l_position);
            }
            else if(menu_answer == 2){
                l_name = name_play();
            }else{
                break;
            }
        }
        sc.close();
    }
}