import React, { useCallback, useRef, useState } from 'react';
import * as Yup from 'yup';
import {
	Platform,
	KeyboardAvoidingView,
	ScrollView,
	View,
	Alert,
	TextInput,
	ActivityIndicator
} from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import { Form } from '@unform/mobile';
import { FormHandles } from '@unform/core';
import Feather from 'react-native-vector-icons/Feather';
import getValidationErrors from '../../utils/getValidationErrors';

import * as Permissions from 'expo-permissions';

import { useAuth } from '../../hooks/auth';

import Input from '../../components/Input';

import {
	Modal,
	ContainerModal,
	Background,
	ContainerTitle,
	ContainerSignIn,
	ImageLogo,
	TitleSignInBold,
	TextForgotPassword,
	ButtonSignIn,
	ButtonSignInAndroid,
	TextSignIn,
	ContainerCredentials,
	TextCredentials,
	TextCredentialsUnderline
} from './styles';

import backgroundImg from '../../assets/images/backgroundSignIn.png';
import logoImg from '../../assets/images/logoVc.png';

interface SignInFormData {
	email: string;
	password: string;
}

const SignIn: React.FC = () => {
	const passwordInputRef = useRef<TextInput>(null);
	const formRef = useRef<FormHandles>(null);
	const { goBack, navigate } = useNavigation();
	const [showLoading, setShowLoading] = useState(false);
	const { signIn } = useAuth();

	const handleActiveNotification = useCallback(async (): Promise<string> => {
		const { granted } = await Permissions.getAsync(Permissions.NOTIFICATIONS);

		if (!granted) {
			const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);

			if (status !== 'granted') {
				Alert.alert(
					'Notificações',
					'Caso queira ser notificado, você deve ir na configuração do aplicativo e ativar as notificações.'
				);
			}
		}

		return '';
	}, []);

	const handleSignIn = useCallback(async (data: SignInFormData) => {
		setShowLoading(true);

		try {
			formRef.current?.setErrors({});

			const schema = Yup.object().shape({
				email: Yup.string().required('E-mail obrigatório').email('Digite um e-mail válido'),
				password: Yup.string().required('Senha obrigatória')
			});

			await schema.validate(data, {
				abortEarly: false
			});

			await signIn({
				email: data.email,
				password: data.password
			});
		} catch (e) {
			setShowLoading(false);

			if (e instanceof Yup.ValidationError) {
				const errors = getValidationErrors(e);

				formRef.current?.setErrors(errors);

				return;
			}

			Alert.alert(
				'Erro na autenticação',
				'Ocorreu um erro ao fazer login, cheque suas credenciais',
				[
					{ text: "Ok" }
				]
			);
		}
	}, [signIn, handleActiveNotification]);

	return (
		<>
			<Background source={backgroundImg} resizeMode='cover'>
				<KeyboardAvoidingView
					style={{ flex: 1 }}
					behavior={Platform.OS === 'ios' ? 'padding' : undefined}
					enabled
				>
					<ScrollView
						keyboardShouldPersistTaps='handled'
						contentContainerStyle={{ flex: 1, opacity: showLoading ? 0.3 : 1 }}

					>
						<TouchableOpacity onPress={() => goBack()}>
							<Feather name='chevron-left' size={25} color='#FFF' style={{ marginTop: 25 }} />
						</TouchableOpacity>

						<ContainerTitle>
							<TitleSignInBold>Entre com suas{'\n'}credenciais</TitleSignInBold>
						</ContainerTitle>
						<ContainerSignIn>
							<Form ref={formRef} onSubmit={handleSignIn}>
								<Input
									name="email"
									icon="mail"
									autoCorrect={false}
									autoCapitalize="none"
									keyboardType="email-address"
									text="E-MAIL"
									returnKeyType="next"
									onSubmitEditing={() => {
										passwordInputRef.current?.focus();
									}}
								/>
								<Input
									ref={passwordInputRef}
									name="password"
									secureTextEntry={true}
									icon="lock"
									text="SENHA"
									returnKeyType="send"
									onSubmitEditing={() => {
										formRef.current?.submitForm();
									}}
								/>

								<TouchableOpacity onPress={() => { navigate('ForgotPassword') }}>
									<TextForgotPassword>Esqueci minha senha</TextForgotPassword>
								</TouchableOpacity>

								{Platform.OS === 'ios' ?
									<ButtonSignIn onPress={() => {
										formRef.current?.submitForm();
									}}>
										<TextSignIn>Entrar</TextSignIn>
									</ButtonSignIn>
									:
									<ButtonSignInAndroid onPress={() => {
										formRef.current?.submitForm();
									}}>
										<TextSignIn>Entrar</TextSignIn>
									</ButtonSignInAndroid>
								}
							</Form>
							<ContainerCredentials onPress={() => { navigate('SignUp') }}>
								<TextCredentials>Não possui uma credencial?</TextCredentials>
								<TextCredentials><TextCredentialsUnderline>Clique aqui</TextCredentialsUnderline> para criar uma conta.</TextCredentials>
							</ContainerCredentials>
						</ContainerSignIn>
					</ScrollView>
				</KeyboardAvoidingView>
			</Background>
			<Modal
				animationType="fade"
				transparent={true}
				visible={showLoading}
			>
				<ContainerModal>
					<ActivityIndicator size="large" color="white" />
				</ContainerModal>
			</Modal>
		</>
	);
}

export default SignIn;